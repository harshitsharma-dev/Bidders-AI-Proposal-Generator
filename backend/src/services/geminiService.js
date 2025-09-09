// services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use flash model for faster responses and lower rate limits
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 2048,
      },
    });
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
  }

  async generateProposal(tender, companyProfile) {
    try {
      const prompt = this.createProposalPrompt(tender, companyProfile);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);

      // Try alternative model if primary fails
      if (error.message.includes("not found")) {
        try {
          console.log("Trying alternative model: gemini-1.5-flash");
          const altModel = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
          });
          const prompt = this.createProposalPrompt(tender, companyProfile);
          const result = await altModel.generateContent(prompt);
          const response = await result.response;
          return response.text();
        } catch (altError) {
          console.error("Alternative model also failed:", altError);
          throw new Error(`Gemini API Error: ${error.message}`);
        }
      }

      throw error;
    }
  }

  createProposalPrompt(tender, profile) {
    return `
            Generate a professional business proposal for the following tender:
            
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
            
            Please generate a comprehensive proposal that includes:
            1. Executive Summary
            2. Understanding of Requirements
            3. Technical Approach
            4. Company Qualifications
            5. Project Timeline
            6. Budget Consideration
            
            Make it professional, specific to the tender requirements, and highlight the company's relevant experience.
            Format the response in a clean, business proposal format.
        `;
  }
}

module.exports = GeminiService;
