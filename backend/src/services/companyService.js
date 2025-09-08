const { db } = require("../config/firebase");
const { generateEmbedding } = require("./vectorService");

class CompanyService {
  constructor() {
    this.collection = "companies";
  }

  // Create company profile
  async createCompany(companyData) {
    try {
      // Generate embedding for company profile
      const profileText = `${companyData.capabilities?.join(" ") || ""} ${
        companyData.certifications?.join(" ") || ""
      } ${companyData.company_name || ""}`;
      const embedding = await generateEmbedding(profileText);

      const company = {
        ...companyData,
        profile_embedding: embedding,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const docRef = await db.collection(this.collection).add(company);

      return {
        id: docRef.id,
        ...company,
      };
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  }

  // Get company by ID
  async getCompanyById(companyId) {
    try {
      const doc = await db.collection(this.collection).doc(companyId).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error getting company:", error);
      throw error;
    }
  }

  // Get company by user ID
  async getCompanyByUserId(userId) {
    try {
      const snapshot = await db
        .collection(this.collection)
        .where("user_id", "==", userId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error getting company by user ID:", error);
      throw error;
    }
  }

  // Update company profile
  async updateCompany(companyId, updateData) {
    try {
      const docRef = db.collection(this.collection).doc(companyId);

      const updatePayload = {
        ...updateData,
        updated_at: new Date(),
      };

      // If capabilities or certifications changed, regenerate embedding
      if (
        updateData.capabilities ||
        updateData.certifications ||
        updateData.company_name
      ) {
        const company = await this.getCompanyById(companyId);
        if (company) {
          const newProfileText = `${
            (updateData.capabilities || company.capabilities)?.join(" ") || ""
          } ${
            (updateData.certifications || company.certifications)?.join(" ") ||
            ""
          } ${updateData.company_name || company.company_name || ""}`;
          const newEmbedding = await generateEmbedding(newProfileText);
          updatePayload.profile_embedding = newEmbedding;
        }
      }

      await docRef.update(updatePayload);

      return await this.getCompanyById(companyId);
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  }

  // Get companies with similar capabilities
  async getSimilarCompanies(companyId, limit = 5) {
    try {
      const company = await this.getCompanyById(companyId);
      if (!company) {
        throw new Error("Company not found");
      }

      // Get all companies for similarity comparison
      const snapshot = await db
        .collection(this.collection)
        .where("id", "!=", companyId)
        .limit(50)
        .get();

      const similarCompanies = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Calculate similarity based on capabilities overlap
        let similarity = 0;
        if (company.capabilities && data.capabilities) {
          const commonCapabilities = company.capabilities.filter((cap) =>
            data.capabilities.some(
              (otherCap) => cap.toLowerCase() === otherCap.toLowerCase()
            )
          );
          similarity =
            commonCapabilities.length /
            Math.max(company.capabilities.length, data.capabilities.length);
        }

        if (similarity > 0) {
          similarCompanies.push({
            id: doc.id,
            ...data,
            similarity,
          });
        }
      });

      return similarCompanies
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting similar companies:", error);
      throw error;
    }
  }

  // Search companies
  async searchCompanies(searchQuery, options = {}) {
    try {
      const { limit = 10, country = null } = options;

      let query = db.collection(this.collection).limit(50);

      if (country) {
        query = query.where("countries", "array-contains", country);
      }

      const snapshot = await query.get();

      const companies = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Simple text search
        const nameMatch = data.company_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const capMatch = data.capabilities?.some((cap) =>
          cap.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const certMatch = data.certifications?.some((cert) =>
          cert.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (nameMatch || capMatch || certMatch) {
          let relevance = 0;
          if (nameMatch) relevance += 0.5;
          if (capMatch) relevance += 0.3;
          if (certMatch) relevance += 0.2;

          companies.push({
            id: doc.id,
            ...data,
            relevance,
          });
        }
      });

      return companies
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);
    } catch (error) {
      console.error("Error searching companies:", error);
      throw error;
    }
  }

  // Delete company
  async deleteCompany(companyId) {
    try {
      await db.collection(this.collection).doc(companyId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  }

  // Get company statistics
  async getCompanyStats(companyId) {
    try {
      // Get proposals count
      const proposalsSnapshot = await db
        .collection("proposals")
        .where("company_id", "==", companyId)
        .get();

      const proposals = [];
      proposalsSnapshot.forEach((doc) => {
        proposals.push(doc.data());
      });

      const totalProposals = proposals.length;
      const submittedProposals = proposals.filter(
        (p) => p.status === "submitted"
      ).length;
      const wonProposals = proposals.filter((p) => p.status === "won").length;
      const successRate =
        submittedProposals > 0 ? (wonProposals / submittedProposals) * 100 : 0;

      // Get total revenue from payments
      const paymentsSnapshot = await db
        .collection("payments")
        .where("company_id", "==", companyId)
        .where("status", "==", "completed")
        .get();

      let totalRevenue = 0;
      paymentsSnapshot.forEach((doc) => {
        const payment = doc.data();
        totalRevenue += payment.amount || 0;
      });

      return {
        totalProposals,
        submittedProposals,
        wonProposals,
        successRate: Math.round(successRate * 100) / 100,
        totalRevenue,
      };
    } catch (error) {
      console.error("Error getting company stats:", error);
      throw error;
    }
  }
}

module.exports = new CompanyService();
