import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../config/firebase";

class TenderFirebaseService {
  constructor() {
    this.collection = "tenders";
  }

  // Get all tenders with pagination
  async getTenders(options = {}) {
    try {
      const {
        limitCount = 10,
        lastVisible = null,
        country = null,
        category = null,
        status = "open",
      } = options;

      let q = query(
        collection(db, this.collection),
        where("status", "==", status),
        orderBy("created_at", "desc"),
        limit(limitCount)
      );

      if (country) {
        q = query(q, where("country", "==", country));
      }

      if (category) {
        q = query(q, where("category", "==", category));
      }

      if (lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);

      const tenders = [];
      snapshot.forEach((doc) => {
        tenders.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return {
        tenders,
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === limitCount,
      };
    } catch (error) {
      console.error("Error getting tenders:", error);
      throw error;
    }
  }

  // Get tender by ID
  async getTenderById(tenderId) {
    try {
      const docRef = doc(db, this.collection, tenderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting tender:", error);
      throw error;
    }
  }

  // Search tenders (client-side filtering for now)
  async searchTenders(searchQuery, options = {}) {
    try {
      const { limitCount = 50, country = null, category = null } = options;

      // Get a larger set to filter through
      const result = await this.getTenders({
        limitCount,
        country,
        category,
      });

      // Filter by search query
      const filteredTenders = result.tenders.filter((tender) => {
        const titleMatch = tender.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const descMatch = tender.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const reqMatch = tender.requirements?.some((req) =>
          req.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return titleMatch || descMatch || reqMatch;
      });

      // Calculate simple relevance score
      const scoredTenders = filteredTenders.map((tender) => {
        let relevance = 0;
        const query = searchQuery.toLowerCase();

        if (tender.title?.toLowerCase().includes(query)) relevance += 0.4;
        if (tender.description?.toLowerCase().includes(query)) relevance += 0.3;
        if (
          tender.requirements?.some((req) => req.toLowerCase().includes(query))
        )
          relevance += 0.3;

        return { ...tender, relevance };
      });

      // Sort by relevance
      return scoredTenders.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error("Error searching tenders:", error);
      throw error;
    }
  }

  // Create tender (admin only)
  async createTender(tenderData) {
    try {
      const tender = {
        ...tenderData,
        created_at: new Date(),
        updated_at: new Date(),
        status: tenderData.status || "open",
      };

      const docRef = await addDoc(collection(db, this.collection), tender);

      return {
        id: docRef.id,
        ...tender,
      };
    } catch (error) {
      console.error("Error creating tender:", error);
      throw error;
    }
  }

  // Update tender
  async updateTender(tenderId, updateData) {
    try {
      const docRef = doc(db, this.collection, tenderId);

      const updatePayload = {
        ...updateData,
        updated_at: new Date(),
      };

      await updateDoc(docRef, updatePayload);

      return await this.getTenderById(tenderId);
    } catch (error) {
      console.error("Error updating tender:", error);
      throw error;
    }
  }

  // Delete tender
  async deleteTender(tenderId) {
    try {
      const docRef = doc(db, this.collection, tenderId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting tender:", error);
      throw error;
    }
  }

  // Get recommendations (simplified)
  async getRecommendations(userProfile, limitCount = 10) {
    try {
      // Get tenders from user's countries
      let q = query(
        collection(db, this.collection),
        where("status", "==", "open"),
        orderBy("created_at", "desc"),
        limit(50) // Get more for better matching
      );

      if (userProfile.countries && userProfile.countries.length > 0) {
        // Note: Firestore 'in' queries are limited to 10 values
        const countries = userProfile.countries.slice(0, 10);
        q = query(q, where("country", "in", countries));
      }

      const snapshot = await getDocs(q);

      const recommendations = [];
      snapshot.forEach((doc) => {
        const tender = { id: doc.id, ...doc.data() };

        // Calculate match score based on capabilities and requirements
        let matchScore = 0;
        if (tender.requirements && userProfile.capabilities) {
          const matchingRequirements = tender.requirements.filter((req) =>
            userProfile.capabilities.some(
              (cap) =>
                cap.toLowerCase().includes(req.toLowerCase()) ||
                req.toLowerCase().includes(cap.toLowerCase())
            )
          );
          matchScore = matchingRequirements.length / tender.requirements.length;
        }

        recommendations.push({
          ...tender,
          similarity: matchScore,
        });
      });

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limitCount);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      throw error;
    }
  }
}

export default new TenderFirebaseService();
