// controllers/proposalController.js
const openaiService = require("../services/geminiService");

class ProposalController {
  // Generate AI proposal for a tender
  static async generateProposal(req, res) {
    try {
      const { tenderId, tenderDetails, companyInfo, customRequirements } =
        req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!tenderId || !tenderDetails) {
        return res.status(400).json({
          success: false,
          message: "Tender ID and details are required",
        });
      }

      console.log(
        `🤖 Generating proposal for user ${userId}, tender ${tenderId}`
      );

      // Prepare context for AI proposal generation
      const proposalContext = {
        tender: {
          id: tenderId,
          title: tenderDetails.title || "Government Tender",
          description: tenderDetails.description || "",
          requirements: tenderDetails.requirements || "",
          budget: tenderDetails.budget || "Not specified",
          deadline: tenderDetails.deadline || "Not specified",
          location: tenderDetails.location || "Not specified",
          category: tenderDetails.category || "General",
        },
        company: {
          name:
            companyInfo?.companyName || req.user.companyName || "Your Company",
          capabilities: companyInfo?.capabilities || [],
          experience:
            companyInfo?.experience ||
            "Extensive experience in government contracting",
          teamSize: companyInfo?.teamSize || "Professional team",
        },
        customRequirements: customRequirements || "",
      };

      // Generate proposal using AI service
      const proposalPrompt = this.buildProposalPrompt(proposalContext);
      const aiResponse = await openaiService.generateText(proposalPrompt);

      // Structure the response
      const proposal = {
        id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenderId,
        userId,
        title: `Proposal for ${proposalContext.tender.title}`,
        content: aiResponse,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          generatedBy: "AI",
          tenderTitle: proposalContext.tender.title,
          companyName: proposalContext.company.name,
        },
      };

      console.log(`✅ Proposal generated successfully for tender ${tenderId}`);

      res.json({
        success: true,
        message: "Proposal generated successfully",
        data: {
          proposal,
          usage: {
            creditsUsed: 1,
            remainingCredits: 1, // Updated to reflect 2 per hour limit
          },
        },
      });
    } catch (error) {
      console.error("❌ Error generating proposal:", error);

      // Handle specific AI service errors
      if (error.message.includes("API key")) {
        return res.status(500).json({
          success: false,
          message: "AI service configuration error. Please contact support.",
        });
      }

      if (error.message.includes("rate limit")) {
        return res.status(429).json({
          success: false,
          message: "AI service rate limit exceeded. Please try again later.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to generate proposal",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get user's proposals
  static async getMyProposals(req, res) {
    try {
      const userId = req.user.id;
      const { status, page = 1, limit = 10 } = req.query;

      console.log(`📋 Fetching proposals for user ${userId}`);

      // In a real app, this would query the database
      // For now, return mock data based on user
      const mockProposals = [
        {
          id: `prop_${Date.now()}_1`,
          tenderId: "tender_123",
          title: "IT Infrastructure Modernization Proposal",
          status: "submitted",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          tenderTitle: "Government IT Infrastructure Upgrade",
          estimatedValue: "$250,000",
        },
        {
          id: `prop_${Date.now()}_2`,
          tenderId: "tender_456",
          title: "Security Consulting Services Proposal",
          status: "draft",
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          tenderTitle: "Cybersecurity Assessment Services",
          estimatedValue: "$150,000",
        },
      ];

      // Filter by status if provided
      let filteredProposals = mockProposals;
      if (status) {
        filteredProposals = mockProposals.filter((p) => p.status === status);
      }

      // Simulate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedProposals = filteredProposals.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          proposals: paginatedProposals,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredProposals.length,
            totalPages: Math.ceil(filteredProposals.length / limit),
          },
        },
      });
    } catch (error) {
      console.error("❌ Error fetching proposals:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch proposals",
      });
    }
  }

  // Update proposal
  static async updateProposal(req, res) {
    try {
      const proposalId = req.params.id;
      const userId = req.user.id;
      const updateData = req.body;

      console.log(`📝 Updating proposal ${proposalId} for user ${userId}`);

      // Validate proposal ownership (in real app, check database)
      if (!proposalId) {
        return res.status(400).json({
          success: false,
          message: "Proposal ID is required",
        });
      }

      // Simulate proposal update
      const updatedProposal = {
        id: proposalId,
        ...updateData,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
      };

      res.json({
        success: true,
        message: "Proposal updated successfully",
        data: {
          proposal: updatedProposal,
        },
      });
    } catch (error) {
      console.error("❌ Error updating proposal:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update proposal",
      });
    }
  }

  // Submit proposal
  static async submitProposal(req, res) {
    try {
      const proposalId = req.params.id;
      const userId = req.user.id;

      console.log(`🚀 Submitting proposal ${proposalId} for user ${userId}`);

      // In real app, validate proposal exists and belongs to user
      // Then update status to 'submitted'

      const submittedProposal = {
        id: proposalId,
        status: "submitted",
        submittedAt: new Date().toISOString(),
        submittedBy: userId,
      };

      res.json({
        success: true,
        message: "Proposal submitted successfully",
        data: {
          proposal: submittedProposal,
          submissionDetails: {
            submittedAt: submittedProposal.submittedAt,
            confirmationNumber: `CONF_${proposalId}_${Date.now()}`,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error submitting proposal:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit proposal",
      });
    }
  }

  // Helper method to build AI proposal prompt
  static buildProposalPrompt(context) {
    return `
You are an expert proposal writer for government tenders. Generate a comprehensive, professional proposal based on the following information:

TENDER DETAILS:
- Title: ${context.tender.title}
- Description: ${context.tender.description}
- Requirements: ${context.tender.requirements}
- Budget: ${context.tender.budget}
- Deadline: ${context.tender.deadline}
- Location: ${context.tender.location}
- Category: ${context.tender.category}

COMPANY INFORMATION:
- Company Name: ${context.company.name}
- Capabilities: ${
      context.company.capabilities.join(", ") || "Professional services"
    }
- Experience: ${context.company.experience}
- Team: ${context.company.teamSize}

CUSTOM REQUIREMENTS:
${context.customRequirements}

Please generate a comprehensive proposal that includes:

1. EXECUTIVE SUMMARY
   - Brief overview of our understanding and approach
   - Key value propositions

2. COMPANY OVERVIEW
   - Our expertise and experience
   - Why we're the right choice

3. TECHNICAL APPROACH
   - Detailed methodology
   - Implementation plan
   - Timeline and milestones

4. TEAM AND RESOURCES
   - Key personnel
   - Resource allocation

5. PROJECT TIMELINE
   - Phases and deliverables
   - Risk mitigation

6. BUDGET BREAKDOWN
   - Cost structure
   - Value justification

7. CONCLUSION
   - Summary of benefits
   - Next steps

Make the proposal professional, compelling, and tailored to the specific tender requirements. Use formal government contracting language and ensure compliance with typical tender submission standards.

Length: Approximately 1500-2000 words.
`;
  }
}

module.exports = ProposalController;
