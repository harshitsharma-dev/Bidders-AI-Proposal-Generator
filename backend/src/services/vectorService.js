// services/vectorService.js
const { OpenAI } = require("openai");
const { Pinecone } = require("@pinecone-database/pinecone");

class VectorService {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }

  async generateEmbedding(text) {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  }

  async findSimilarTenders(companyProfile, limit = 10) {
    const profileText = this.createProfileText(companyProfile);
    const embedding = await this.generateEmbedding(profileText);

    // Query vector database for similar tenders
    const index = this.pinecone.Index("tenders");
    const queryResponse = await index.query({
      vector: embedding,
      topK: limit,
      includeMetadata: true,
    });

    return queryResponse.matches;
  }

  createProfileText(profile) {
    return `${profile.capabilities.join(" ")} ${profile.certifications.join(
      " "
    )} 
                ${profile.countries.join(" ")} experience: ${
      profile.experience_years
    } years`;
  }
}

const vectorService = new VectorService();
module.exports = vectorService;

// Also export the generateEmbedding function directly
module.exports.generateEmbedding = async (text) => {
  return await vectorService.generateEmbedding(text);
};
