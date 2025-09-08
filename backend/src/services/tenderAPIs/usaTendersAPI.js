const axios = require("axios");

class USATendersAPI {
  constructor() {
    this.baseURL = "https://api.sam.gov/prod/opportunities/v2/search";
    this.apiKey = process.env.SAM_GOV_API_KEY;
  }

  async fetchTenders(params = {}) {
    try {
      const defaultParams = {
        limit: 50,
        offset: 0,
        postedFrom: this.formatDate(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ),
        postedTo: this.formatDate(new Date()),
        ptype: "o",
      };

      // If no API key, return mock data
      if (!this.apiKey || this.apiKey === "your-sam-gov-api-key") {
        return this.getMockUSATenders();
      }

      const response = await axios.get(this.baseURL, {
        headers: {
          "X-Api-Key": this.apiKey,
          "Content-Type": "application/json",
        },
        params: { ...defaultParams, ...params },
        timeout: 10000,
      });

      return this.transformTenders(response.data.opportunitiesData || []);
    } catch (error) {
      console.error("USA Tenders API Error:", error.message);
      return this.getMockUSATenders();
    }
  }

  getMockUSATenders() {
    return [
      {
        id: "usa-001-" + Date.now(),
        title: "AI-Powered Traffic Management System",
        description:
          "Develop and implement an AI-driven traffic management system for smart city initiative including real-time optimization and predictive analytics capabilities.",
        country: "USA",
        region: "National",
        budget: 2800000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Technology",
        requirements: [
          "AI/ML",
          "IoT Integration",
          "Cloud Computing",
          "Real-time Systems",
        ],
        status: "open",
        source: "SAM.gov",
        sourceUrl: "https://sam.gov/opp/",
        contactInfo: {
          department: "Department of Transportation",
          phone: "+1-555-0123",
          email: "procurement@dot.gov",
        },
        location: {
          city: "Washington",
          state: "DC",
          country: "USA",
          coordinates: { lat: 38.9072, lng: -77.0369 },
        },
      },
      {
        id: "usa-002-" + Date.now(),
        title: "Cybersecurity Framework Implementation",
        description:
          "Implementation of comprehensive cybersecurity framework for federal agencies including threat detection, incident response, and compliance monitoring systems.",
        country: "USA",
        region: "Federal",
        budget: 5500000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Cybersecurity",
        requirements: [
          "Cybersecurity",
          "Incident Response",
          "Compliance",
          "Risk Assessment",
        ],
        status: "open",
        source: "SAM.gov",
        sourceUrl: "https://sam.gov/opp/",
        contactInfo: {
          department: "Department of Homeland Security",
          phone: "+1-555-0124",
          email: "cyber@dhs.gov",
        },
        location: {
          city: "Arlington",
          state: "VA",
          country: "USA",
          coordinates: { lat: 38.8816, lng: -77.091 },
        },
      },
      {
        id: "usa-003-" + Date.now(),
        title: "Cloud Infrastructure Modernization",
        description:
          "Modernization of legacy government systems to cloud-based infrastructure with focus on scalability, security, and cost optimization.",
        country: "USA",
        region: "Multi-State",
        budget: 12000000,
        deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Cloud Computing",
        requirements: [
          "Cloud Computing",
          "System Migration",
          "Security",
          "DevOps",
        ],
        status: "open",
        source: "SAM.gov",
        sourceUrl: "https://sam.gov/opp/",
        contactInfo: {
          department: "General Services Administration",
          phone: "+1-555-0125",
          email: "cloud@gsa.gov",
        },
        location: {
          city: "San Francisco",
          state: "CA",
          country: "USA",
          coordinates: { lat: 37.7749, lng: -122.4194 },
        },
      },
    ];
  }

  transformTenders(data) {
    return data.map((tender) => ({
      id: tender.noticeId || `usa-${Date.now()}-${Math.random()}`,
      title: tender.title,
      description:
        tender.description || tender.synopsis || "No description available",
      country: "USA",
      region: tender.state || "Federal",
      budget: this.extractBudget(tender.award?.amount),
      deadline: tender.responseDeadLine,
      category: tender.classificationCode?.description || "General",
      requirements: this.extractRequirements(tender.description),
      status: "open",
      source: "SAM.gov",
      sourceUrl: `https://sam.gov/opp/${tender.noticeId}/view`,
      contactInfo: tender.pointOfContact?.[0] || {},
      location: this.extractLocation(tender),
      originalData: tender,
    }));
  }

  extractBudget(awardAmount) {
    if (!awardAmount) return null;
    const numericValue = parseFloat(awardAmount.replace(/[^0-9.]/g, ""));
    return isNaN(numericValue) ? null : numericValue;
  }

  extractRequirements(description) {
    if (!description) return [];
    const keywords = [
      "AI",
      "ML",
      "Cloud",
      "Software",
      "IT",
      "Security",
      "Data",
      "Analytics",
      "IoT",
      "DevOps",
    ];
    return keywords.filter((keyword) =>
      description.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  extractLocation(tender) {
    return {
      city: tender.placeOfPerformanceCity || "Washington",
      state: tender.placeOfPerformanceState || "DC",
      country: "USA",
      coordinates: { lat: 38.9072, lng: -77.0369 }, // Default to DC
    };
  }

  formatDate(date) {
    return date.toISOString().split("T")[0];
  }
}

module.exports = USATendersAPI;
