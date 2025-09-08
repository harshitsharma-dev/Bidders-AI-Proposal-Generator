// services/openaiService.js (renamed from geminiService.js)
const { OpenAI } = require("openai");

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateProposal(tender, companyProfile) {
    try {
      const prompt = this.createProposalPrompt(tender, companyProfile);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a professional business proposal writer with expertise in creating compelling, detailed proposals for government and corporate tenders. Generate well-structured, professional proposals that highlight company strengths and address specific tender requirements.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API Error:", error);

      // If we hit rate limits, try with a shorter prompt
      if (error.status === 429) {
        console.log(
          "Rate limit hit, waiting and retrying with shorter prompt..."
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));

        try {
          const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Write a professional business proposal for tender: "${
                  tender.title
                }". Company: ${companyProfile.companyName} with ${
                  companyProfile.experience
                } years experience. Budget: $${tender.budget}. Requirements: ${
                  tender.requirements
                    ? tender.requirements.join(", ")
                    : "Various"
                }. Include executive summary, technical approach, qualifications, and timeline.`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.5,
          });

          return completion.choices[0].message.content;
        } catch (retryError) {
          console.error("Retry also failed:", retryError);
          throw new Error(`OpenAI API Error: ${error.message}`);
        }
      }

      throw error;
    }
  }

  createProposalPrompt(tender, profile) {
    return `
            Generate a comprehensive professional business proposal for the following tender:
            
            TENDER DETAILS:
            Title: ${tender.title}
            Description: ${tender.description}
            Budget: $${tender.budget}
            Requirements: ${
              tender.requirements
                ? tender.requirements.join(", ")
                : "Not specified"
            }
            Country: ${tender.country || "Not specified"}
            
            COMPANY PROFILE:
            Company Name: ${profile.companyName}
            Capabilities: ${
              profile.capabilities
                ? profile.capabilities.join(", ")
                : "Not specified"
            }
            Experience: ${profile.experience} years
            Completed Projects: ${profile.completedProjects}
            Success Rate: ${profile.successRate}%
            Certifications: ${
              profile.certifications
                ? profile.certifications.join(", ")
                : "None specified"
            }
            
            Please generate a well-structured proposal that includes:
            1. EXECUTIVE SUMMARY - Brief overview and value proposition
            2. PROJECT UNDERSTANDING - Demonstrate comprehension of requirements
            3. TECHNICAL APPROACH - Methodology and implementation strategy
            4. COMPANY QUALIFICATIONS - Relevant experience and certifications
            5. PROJECT TIMELINE - High-level milestones and delivery schedule
            6. BUDGET CONSIDERATION - Value proposition within budget constraints
            
            Make it professional, specific to the tender requirements, and highlight the company's relevant experience and capabilities. Use a formal business tone and clear structure.
        `;
  }
}

module.exports = OpenAIService;
