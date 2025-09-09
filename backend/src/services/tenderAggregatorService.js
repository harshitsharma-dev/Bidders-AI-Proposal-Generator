const USATendersAPI = require("./tenderAPIs/usaTendersAPI");
const UKTendersAPI = require("./tenderAPIs/ukTendersAPI");
const CanadaTendersAPI = require("./tenderAPIs/canadaTendersAPI");
const AustraliaTendersAPI = require("./tenderAPIs/australiaTendersAPI");
const OpenAIService = require("./openaiService");

class TenderAggregatorService {
  constructor() {
    this.apis = {
      usa: new USATendersAPI(),
      uk: new UKTendersAPI(),
      canada: new CanadaTendersAPI(),
      australia: new AustraliaTendersAPI(),
    };
    this.openaiService = new OpenAIService();
    this.cache = new Map();
    this.cacheTimeout = 1800000; // 30 minutes
  }

  async fetchAllTenders(countries = ["usa", "uk", "canada", "australia"]) {
    const cacheKey = countries.sort().join("-");

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`Returning cached tenders for: ${countries.join(", ")}`);
        return cached.data;
      }
    }

    console.log(`Fetching fresh tender data from: ${countries.join(", ")}`);

    const promises = countries.map(async (country) => {
      try {
        if (this.apis[country.toLowerCase()]) {
          const tenders = await this.apis[country.toLowerCase()].fetchTenders();
          return tenders.map((tender) => ({
            ...tender,
            country: country.toUpperCase(),
            similarity: this.calculateBaseSimilarity(tender),
            bidsCount: Math.floor(Math.random() * 50) + 5,
            timeLeft: this.calculateTimeLeft(tender.deadline),
            fetchedAt: new Date().toISOString(),
          }));
        }
        return [];
      } catch (error) {
        console.error(`Error fetching ${country} tenders:`, error.message);
        return [];
      }
    });

    const results = await Promise.all(promises);
    const allTenders = results.flat().filter((tender) => tender.id);

    // Sort by deadline and relevance
    allTenders.sort((a, b) => {
      // First by similarity (descending)
      if (b.similarity !== a.similarity) {
        return b.similarity - a.similarity;
      }
      // Then by deadline (ascending - soonest first)
      return new Date(a.deadline) - new Date(b.deadline);
    });

    // Cache the results
    this.cache.set(cacheKey, {
      data: allTenders,
      timestamp: Date.now(),
    });

    console.log(
      `✅ Fetched ${allTenders.length} tenders from ${countries.length} countries`
    );
    return allTenders;
  }

  async searchTenders(
    query,
    countries = ["usa", "uk", "canada", "australia"],
    filters = {}
  ) {
    const allTenders = await this.fetchAllTenders(countries);

    let filteredTenders = allTenders;

    // Apply text search
    if (query && query.trim()) {
      const queryLower = query.toLowerCase();
      filteredTenders = filteredTenders.filter(
        (tender) =>
          tender.title.toLowerCase().includes(queryLower) ||
          tender.description.toLowerCase().includes(queryLower) ||
          tender.category.toLowerCase().includes(queryLower) ||
          tender.requirements.some((req) =>
            req.toLowerCase().includes(queryLower)
          ) ||
          (tender.region && tender.region.toLowerCase().includes(queryLower))
      );

      // Boost similarity for search matches
      filteredTenders = filteredTenders.map((tender) => ({
        ...tender,
        similarity: this.calculateSearchSimilarity(tender, query),
      }));
    }

    // Apply filters
    if (filters.category) {
      filteredTenders = filteredTenders.filter((tender) =>
        tender.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.minBudget) {
      filteredTenders = filteredTenders.filter(
        (tender) =>
          tender.budget && tender.budget >= parseFloat(filters.minBudget)
      );
    }

    if (filters.maxBudget) {
      filteredTenders = filteredTenders.filter(
        (tender) =>
          tender.budget && tender.budget <= parseFloat(filters.maxBudget)
      );
    }

    if (filters.region) {
      filteredTenders = filteredTenders.filter(
        (tender) =>
          tender.region &&
          tender.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    if (filters.requirements && filters.requirements.length > 0) {
      filteredTenders = filteredTenders.filter((tender) =>
        filters.requirements.some((req) =>
          tender.requirements.some((tenderReq) =>
            tenderReq.toLowerCase().includes(req.toLowerCase())
          )
        )
      );
    }

    // Sort by relevance
    filteredTenders.sort((a, b) => b.similarity - a.similarity);

    return filteredTenders;
  }

  async getTendersByCountry(country) {
    const countryLower = country.toLowerCase();
    if (!this.apis[countryLower]) {
      throw new Error(
        `Unsupported country: ${country}. Supported countries: ${Object.keys(
          this.apis
        ).join(", ")}`
      );
    }

    return await this.fetchAllTenders([countryLower]);
  }

  async getTendersByLocation(location) {
    const allTenders = await this.fetchAllTenders();

    const locationLower = location.toLowerCase();

    return allTenders.filter((tender) => {
      if (!tender.location) return false;

      return (
        (tender.location.city &&
          tender.location.city.toLowerCase().includes(locationLower)) ||
        (tender.location.state &&
          tender.location.state.toLowerCase().includes(locationLower)) ||
        (tender.location.province &&
          tender.location.province.toLowerCase().includes(locationLower)) ||
        (tender.location.region &&
          tender.location.region.toLowerCase().includes(locationLower)) ||
        (tender.region && tender.region.toLowerCase().includes(locationLower))
      );
    });
  }

  async getRecommendations(companyProfile) {
    const allTenders = await this.fetchAllTenders();

    if (!companyProfile || !companyProfile.capabilities) {
      return allTenders.slice(0, 20); // Return top 20 if no profile
    }

    // Calculate match scores
    const recommendedTenders = allTenders.map((tender) => {
      const matchingRequirements = tender.requirements.filter((req) =>
        companyProfile.capabilities.some(
          (cap) =>
            cap.toLowerCase().includes(req.toLowerCase()) ||
            req.toLowerCase().includes(cap.toLowerCase())
        )
      );

      const capabilityMatch =
        matchingRequirements.length / Math.max(tender.requirements.length, 1);
      const budgetMatch = this.calculateBudgetMatch(
        tender.budget,
        companyProfile
      );
      const locationMatch = this.calculateLocationMatch(tender, companyProfile);

      const overallSimilarity =
        capabilityMatch * 0.5 + budgetMatch * 0.3 + locationMatch * 0.2;

      return {
        ...tender,
        similarity: overallSimilarity,
        matchingRequirements,
        matchReasons: this.generateMatchReasons(tender, companyProfile, {
          capabilityMatch,
          budgetMatch,
          locationMatch,
        }),
      };
    });

    // Filter and sort by similarity
    const topRecommendations = recommendedTenders
      .filter((tender) => tender.similarity > 0.1) // At least 10% match
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50); // Top 50 recommendations

    return topRecommendations;
  }

  calculateBaseSimilarity(tender) {
    // Base similarity calculation
    let score = 0.5;

    // Boost for recent tenders
    const daysUntilDeadline = this.getDaysUntilDeadline(tender.deadline);
    if (daysUntilDeadline > 0 && daysUntilDeadline <= 90) {
      score += 0.2;
    }

    // Boost for technology-related tenders
    const techKeywords = [
      "AI",
      "Technology",
      "Software",
      "Digital",
      "Cloud",
      "Data",
    ];
    const hasTechKeywords = techKeywords.some(
      (keyword) =>
        tender.title.toLowerCase().includes(keyword.toLowerCase()) ||
        tender.category.toLowerCase().includes(keyword.toLowerCase()) ||
        tender.requirements.some((req) =>
          req.toLowerCase().includes(keyword.toLowerCase())
        )
    );

    if (hasTechKeywords) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  calculateSearchSimilarity(tender, query) {
    const queryLower = query.toLowerCase();
    let score = tender.similarity;

    // Boost for exact matches in title
    if (tender.title.toLowerCase().includes(queryLower)) {
      score += 0.3;
    }

    // Boost for matches in requirements
    const matchingReqs = tender.requirements.filter((req) =>
      req.toLowerCase().includes(queryLower)
    );
    score += matchingReqs.length * 0.1;

    return Math.min(score, 1.0);
  }

  calculateBudgetMatch(tenderBudget, profile) {
    if (!tenderBudget || !profile.totalRevenue) return 0.5;

    const ratio = tenderBudget / profile.totalRevenue;
    if (ratio >= 0.1 && ratio <= 0.5) return 1.0; // Sweet spot
    if (ratio < 0.1) return 0.8; // Small project
    if (ratio > 0.5) return 0.6; // Large project
    return 0.3;
  }

  calculateLocationMatch(tender, profile) {
    if (!tender.location || !profile.countries) return 0.5;

    const profileCountries = profile.countries.map((c) => c.toLowerCase());
    const tenderCountry = tender.country.toLowerCase();

    return profileCountries.includes(tenderCountry) ? 1.0 : 0.3;
  }

  generateMatchReasons(tender, profile, matches) {
    const reasons = [];

    if (matches.capabilityMatch > 0.7) {
      reasons.push(
        `Strong capability match: Your expertise in ${profile.capabilities
          .slice(0, 3)
          .join(", ")} aligns well`
      );
    }

    if (matches.budgetMatch > 0.8) {
      reasons.push("Project budget fits your company size and experience");
    }

    if (matches.locationMatch > 0.8) {
      reasons.push(`You have experience in ${tender.country}`);
    }

    if (reasons.length === 0) {
      reasons.push("Potential opportunity based on market trends");
    }

    return reasons;
  }

  calculateTimeLeft(deadline) {
    if (!deadline) return "Unknown";

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;

    if (diffTime < 0) return "Expired";

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  }

  getDaysUntilDeadline(deadline) {
    if (!deadline) return -1;

    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Get statistics about available tenders
  async getTenderStats() {
    const allTenders = await this.fetchAllTenders();

    const stats = {
      total: allTenders.length,
      byCountry: {},
      byCategory: {},
      byRegion: {},
      totalBudget: 0,
      openTenders: 0,
      recentTenders: 0,
      averageBudget: 0,
      topCategories: [],
      topRegions: [],
    };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let budgetSum = 0;
    let budgetCount = 0;

    allTenders.forEach((tender) => {
      // By country
      stats.byCountry[tender.country] =
        (stats.byCountry[tender.country] || 0) + 1;

      // By category
      stats.byCategory[tender.category] =
        (stats.byCategory[tender.category] || 0) + 1;

      // By region
      if (tender.region) {
        stats.byRegion[tender.region] =
          (stats.byRegion[tender.region] || 0) + 1;
      }

      // Budget calculations
      if (tender.budget && tender.budget > 0) {
        stats.totalBudget += tender.budget;
        budgetSum += tender.budget;
        budgetCount++;
      }

      // Open tenders
      if (tender.status === "open") {
        stats.openTenders++;
      }

      // Recent tenders
      if (tender.deadline && new Date(tender.deadline) > thirtyDaysAgo) {
        stats.recentTenders++;
      }
    });

    stats.averageBudget = budgetCount > 0 ? budgetSum / budgetCount : 0;

    // Top categories (sorted by count)
    stats.topCategories = Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count }));

    // Top regions (sorted by count)
    stats.topRegions = Object.entries(stats.byRegion)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([region, count]) => ({ region, count }));

    return stats;
  }

  async getCountriesWithTenders() {
    return Object.keys(this.apis).map((country) => ({
      code: country,
      name: this.getCountryName(country),
      flag: this.getCountryFlag(country),
      supported: true,
    }));
  }

  getCountryName(code) {
    const names = {
      usa: "United States",
      uk: "United Kingdom",
      canada: "Canada",
      australia: "Australia",
    };
    return names[code] || code;
  }

  getCountryFlag(code) {
    const flags = {
      usa: "🇺🇸",
      uk: "🇬🇧",
      canada: "🇨🇦",
      australia: "🇦🇺",
    };
    return flags[code] || "🌍";
  }

  clearCache() {
    this.cache.clear();
    console.log("Tender cache cleared");
  }
}

module.exports = TenderAggregatorService;
