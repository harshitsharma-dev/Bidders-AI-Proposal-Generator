// services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use flash model for faster responses and lower rate limits
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        maxOutputTokens: 4096, // Increased for longer proposals
      },
    });
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
  }

  async generateProposal(tender, companyProfile) {
    // Add input validation
    if (!tender || !tender.title || !tender.description) {
      throw new Error("Tender information is incomplete");
    }
    
    if (!companyProfile || !companyProfile.companyName) {
      throw new Error("Company profile is incomplete");
    }

    try {
      // Add rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
        );
      }
      this.lastRequestTime = Date.now();

      const prompt = this.createProposalPrompt(tender, companyProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);

      // Try alternative model if primary fails
      if (error.message.includes("not found") || error.message.includes("model")) {
        try {
          console.log("Trying alternative model: gemini-1.5-pro-latest");
          const altModel = this.genAI.getGenerativeModel({
            model: "gemini-1.5-pro-latest", // ✅ Use Pro model as fallback
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              maxOutputTokens: 4096,
            },
          });
          const prompt = this.createProposalPrompt(tender, companyProfile);
          const result = await altModel.generateContent(prompt);
          const response = await result.response;
          return response.text();
        } catch (altError) {
          console.error("Alternative model also failed:", altError);
          throw new Error(`Both Gemini models failed: ${altError.message}`);
        }
      }

      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  async editProposal(editPrompt) {
    try {
      const result = await this.model.generateContent(editPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error during edit:", error);
      
      // Try fallback model for edits too
      if (error.message.includes("not found") || error.message.includes("model")) {
        try {
          console.log("Trying alternative model for edit");
          const altModel = this.genAI.getGenerativeModel({
            model: "gemini-1.5-pro-latest",
            generationConfig: {
              temperature: 0.7,
              topP: 0.8,
              maxOutputTokens: 4096,
            },
          });
          const result = await altModel.generateContent(structuredPrompt);
          const response = await result.response;
          return response.text();
        } catch (altError) {
          console.error("Alternative model failed for edit:", altError);
          throw new Error(`Both models failed for editing: ${altError.message}`);
        }
      }
      
      throw new Error(`Failed to edit proposal: ${error.message}`);
    }
  }

  createProposalPrompt(tender, profile) {
    return `
You are a professional proposal writer. Generate a comprehensive business proposal based on the following information:

TENDER INFORMATION:
- Title: ${tender.title || 'Not specified'}
- Description: ${tender.description || 'Not specified'}
- Budget: $${tender.budget ? tender.budget.toLocaleString() : 'Not specified'}
- Requirements: ${tender.requirements && tender.requirements.length > 0 ? tender.requirements.join(', ') : 'Not specified'}
- Location: ${tender.country || 'Not specified'}
- Deadline: ${tender.deadline || 'Not specified'}

COMPANY INFORMATION:
- Company: ${profile.companyName || 'Not specified'}
- Core Capabilities: ${profile.capabilities && profile.capabilities.length > 0 ? profile.capabilities.join(', ') : 'Not specified'}
- Years of Experience: ${profile.experience || 'Not specified'}
- Completed Projects: ${profile.completedProjects || 'Not specified'}
- Success Rate: ${profile.successRate || 'Not specified'}%
- Certifications: ${profile.certifications && profile.certifications.length > 0 ? profile.certifications.join(', ') : 'None'}
- Countries of Operation: ${profile.countries && profile.countries.length > 0 ? profile.countries.join(', ') : 'Not specified'}

PROPOSAL REQUIREMENTS:
Generate a professional proposal with these sections:

1. EXECUTIVE SUMMARY
2. PROJECT UNDERSTANDING
3. TECHNICAL APPROACH & METHODOLOGY
4. COMPANY QUALIFICATIONS & EXPERIENCE
5. PROJECT TIMELINE & MILESTONES
6. TEAM STRUCTURE & EXPERTISE
7. BUDGET BREAKDOWN & VALUE PROPOSITION
8. RISK MANAGEMENT
9. QUALITY ASSURANCE
10. CONCLUSION & NEXT STEPS

FORMATTING GUIDELINES:
- Use clear section headers (ALL CAPS)
- Write in professional business language
- Be specific and avoid generic statements
- Include actual data from the provided information
- Keep each section concise but comprehensive
- Use bullet points where appropriate
- Do not use markdown formatting (**, *, etc.)
- Write in plain text format

Generate a complete, professional proposal that directly addresses the tender requirements and showcases the company's relevant experience and capabilities.
`;
  }
}

module.exports = GeminiService;
