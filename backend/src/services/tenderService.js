const { db } = require("../config/firebase");
const { generateEmbedding } = require("./vectorService");

class TenderService {
  constructor() {
    this.collection = "tenders";
  }

  // Create a new tender with vector embedding
  async createTender(tenderData) {
    try {
      // Generate embedding for the tender
      const embedding = await generateEmbedding(
        `${tenderData.title} ${tenderData.description} ${
          tenderData.requirements?.join(" ") || ""
        }`
      );

      const tender = {
        ...tenderData,
        vector_embedding: embedding,
        created_at: new Date(),
        updated_at: new Date(),
        status: tenderData.status || "open",
      };

      const docRef = await db.collection(this.collection).add(tender);

      return {
        id: docRef.id,
        ...tender,
      };
    } catch (error) {
      console.error("Error creating tender:", error);
      throw error;
    }
  }

  // Get tender by ID
  async getTenderById(tenderId) {
    try {
      const doc = await db.collection(this.collection).doc(tenderId).get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Error getting tender:", error);
      throw error;
    }
  }

  // Get all tenders with pagination
  async getTenders(options = {}) {
    try {
      const {
        limit = 10,
        lastDoc = null,
        country = null,
        category = null,
        status = "open",
      } = options;

      let query = db
        .collection(this.collection)
        .where("status", "==", status)
        .orderBy("created_at", "desc")
        .limit(limit);

      if (country) {
        query = query.where("country", "==", country);
      }

      if (category) {
        query = query.where("category", "==", category);
      }

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      const tenders = [];
      snapshot.forEach((doc) => {
        tenders.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        tenders,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === limit,
      };
    } catch (error) {
      console.error("Error getting tenders:", error);
      throw error;
    }
  }

  // Search tenders by text
  async searchTenders(searchQuery, options = {}) {
    try {
      const { limit = 10, country = null, category = null } = options;

      // Generate embedding for search query
      const queryEmbedding = await generateEmbedding(searchQuery);

      // Get all tenders (we'll implement vector similarity search later)
      let query = db
        .collection(this.collection)
        .where("status", "==", "open")
        .limit(100); // Get more docs for similarity comparison

      if (country) {
        query = query.where("country", "==", country);
      }

      if (category) {
        query = query.where("category", "==", category);
      }

      const snapshot = await query.get();

      const tenders = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Simple text search for now - you can enhance with vector similarity
        const titleMatch = data.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const descMatch = data.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const reqMatch = data.requirements?.some((req) =>
          req.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (titleMatch || descMatch || reqMatch) {
          // Calculate similarity score (simplified - you can use actual vector similarity)
          let similarity = 0;
          if (titleMatch) similarity += 0.4;
          if (descMatch) similarity += 0.3;
          if (reqMatch) similarity += 0.3;

          tenders.push({
            id: doc.id,
            ...data,
            similarity,
          });
        }
      });

      // Sort by similarity and limit results
      return tenders
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error("Error searching tenders:", error);
      throw error;
    }
  }

  // Get recommendations based on company profile
  async getRecommendations(companyProfile, limit = 10) {
    try {
      // Generate embedding for company capabilities
      const profileText = `${companyProfile.capabilities?.join(" ") || ""} ${
        companyProfile.certifications?.join(" ") || ""
      }`;
      const profileEmbedding = await generateEmbedding(profileText);

      // Get tenders from countries where company operates
      let query = db
        .collection(this.collection)
        .where("status", "==", "open")
        .limit(50); // Get more for better matching

      if (companyProfile.countries && companyProfile.countries.length > 0) {
        query = query.where("country", "in", companyProfile.countries);
      }

      const snapshot = await query.get();

      const recommendations = [];
      snapshot.forEach((doc) => {
        const data = doc.data();

        // Calculate match score based on capabilities and requirements
        let matchScore = 0;
        if (data.requirements && companyProfile.capabilities) {
          const matchingRequirements = data.requirements.filter((req) =>
            companyProfile.capabilities.some(
              (cap) =>
                cap.toLowerCase().includes(req.toLowerCase()) ||
                req.toLowerCase().includes(cap.toLowerCase())
            )
          );
          matchScore = matchingRequirements.length / data.requirements.length;
        }

        recommendations.push({
          id: doc.id,
          ...data,
          similarity: matchScore,
        });
      });

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  }

  // Update tender
  async updateTender(tenderId, updateData) {
    try {
      const docRef = db.collection(this.collection).doc(tenderId);

      const updatePayload = {
        ...updateData,
        updated_at: new Date(),
      };

      // If title, description, or requirements changed, regenerate embedding
      if (
        updateData.title ||
        updateData.description ||
        updateData.requirements
      ) {
        const tender = await this.getTenderById(tenderId);
        if (tender) {
          const newEmbedding = await generateEmbedding(
            `${updateData.title || tender.title} ${
              updateData.description || tender.description
            } ${
              (updateData.requirements || tender.requirements)?.join(" ") || ""
            }`
          );
          updatePayload.vector_embedding = newEmbedding;
        }
      }

      await docRef.update(updatePayload);

      return await this.getTenderById(tenderId);
    } catch (error) {
      console.error("Error updating tender:", error);
      throw error;
    }
  }

  // Delete tender
  async deleteTender(tenderId) {
    try {
      await db.collection(this.collection).doc(tenderId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting tender:", error);
      throw error;
    }
  }

  // Bulk import tenders (for scraping)
  async bulkCreateTenders(tendersArray) {
    try {
      const batch = db.batch();
      const createdTenders = [];

      for (const tenderData of tendersArray) {
        // Generate embedding for each tender
        const embedding = await generateEmbedding(
          `${tenderData.title} ${tenderData.description} ${
            tenderData.requirements?.join(" ") || ""
          }`
        );

        const tender = {
          ...tenderData,
          vector_embedding: embedding,
          created_at: new Date(),
          updated_at: new Date(),
          status: tenderData.status || "open",
        };

        const docRef = db.collection(this.collection).doc();
        batch.set(docRef, tender);

        createdTenders.push({
          id: docRef.id,
          ...tender,
        });
      }

      await batch.commit();
      return createdTenders;
    } catch (error) {
      console.error("Error bulk creating tenders:", error);
      throw error;
    }
  }
}

module.exports = new TenderService();
