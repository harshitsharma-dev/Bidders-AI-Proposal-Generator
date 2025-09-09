const { db } = require("../config/firebase");

class ProposalService {
  constructor() {
    this.collection = "proposals";
  }

  // Create a new proposal
  async createProposal(proposalData) {
    try {
      const proposal = {
        ...proposalData,
        created_at: new Date(),
        updated_at: new Date(),
        status: proposalData.status || "draft",
      };

      const docRef = await db.collection(this.collection).add(proposal);

      return {
        id: docRef.id,
        ...proposal,
      };
    } catch (error) {
      console.error("Error creating proposal:", error);
      throw error;
    }
  }

  // Get proposal by ID
  async getProposalById(proposalId) {
    try {
      const doc = await db.collection(this.collection).doc(proposalId).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error getting proposal:", error);
      throw error;
    }
  }

  // Get proposals by company
  async getProposalsByCompany(companyId, options = {}) {
    try {
      const { limit = 10, status = null } = options;

      let query = db
        .collection(this.collection)
        .where("company_id", "==", companyId)
        .orderBy("created_at", "desc")
        .limit(limit);

      if (status) {
        query = query.where("status", "==", status);
      }

      const snapshot = await query.get();

      const proposals = [];
      snapshot.forEach((doc) => {
        proposals.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return proposals;
    } catch (error) {
      console.error("Error getting proposals by company:", error);
      throw error;
    }
  }

  // Get proposals by tender
  async getProposalsByTender(tenderId, options = {}) {
    try {
      const { limit = 10, status = null } = options;

      let query = db
        .collection(this.collection)
        .where("tender_id", "==", tenderId)
        .orderBy("created_at", "desc")
        .limit(limit);

      if (status) {
        query = query.where("status", "==", status);
      }

      const snapshot = await query.get();

      const proposals = [];
      snapshot.forEach((doc) => {
        proposals.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return proposals;
    } catch (error) {
      console.error("Error getting proposals by tender:", error);
      throw error;
    }
  }

  // Update proposal
  async updateProposal(proposalId, updateData) {
    try {
      const docRef = db.collection(this.collection).doc(proposalId);

      const updatePayload = {
        ...updateData,
        updated_at: new Date(),
      };

      // If status is being changed to submitted, set submitted_at
      if (updateData.status === "submitted" && !updateData.submitted_at) {
        updatePayload.submitted_at = new Date();
      }

      await docRef.update(updatePayload);

      return await this.getProposalById(proposalId);
    } catch (error) {
      console.error("Error updating proposal:", error);
      throw error;
    }
  }

  // Submit proposal
  async submitProposal(proposalId) {
    try {
      return await this.updateProposal(proposalId, {
        status: "submitted",
        submitted_at: new Date(),
      });
    } catch (error) {
      console.error("Error submitting proposal:", error);
      throw error;
    }
  }

  // Delete proposal
  async deleteProposal(proposalId) {
    try {
      await db.collection(this.collection).doc(proposalId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting proposal:", error);
      throw error;
    }
  }

  // Check if company already has proposal for tender
  async hasExistingProposal(companyId, tenderId) {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("company_id", "==", companyId)
        .where("tender_id", "==", tenderId)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error("Error checking existing proposal:", error);
      throw error;
    }
  }

  // Get proposal statistics for company
  async getProposalStats(companyId) {
    try {
      const proposals = await this.getProposalsByCompany(companyId, {
        limit: 1000,
      });

      const stats = {
        total: proposals.length,
        draft: proposals.filter((p) => p.status === "draft").length,
        submitted: proposals.filter((p) => p.status === "submitted").length,
        won: proposals.filter((p) => p.status === "won").length,
        lost: proposals.filter((p) => p.status === "lost").length,
        success_rate: 0,
      };

      if (stats.submitted > 0) {
        stats.success_rate = (stats.won / stats.submitted) * 100;
      }

      return stats;
    } catch (error) {
      console.error("Error getting proposal stats:", error);
      throw error;
    }
  }
}

module.exports = new ProposalService();
