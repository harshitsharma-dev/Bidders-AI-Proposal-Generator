const axios = require("axios");

class CanadaTendersAPI {
  constructor() {
    this.baseURL =
      "https://buyandsell.gc.ca/procurement-data/open-contracting-data";
    this.gedsURL = "https://geds-sage.gc.ca/api/org";
  }

  async fetchTenders(params = {}) {
    try {
      const contractingData = await this.getOpenContractingData();
      if (contractingData.length > 0) {
        return this.transformTenders(contractingData);
      }

      return this.getMockCanadianTenders();
    } catch (error) {
      console.error("Canada Tenders API Error:", error.message);
      return this.getMockCanadianTenders();
    }
  }

  async getOpenContractingData() {
    try {
      const response = await axios.get(
        "https://buyandsell.gc.ca/cds/public/ocds/tenders.json",
        {
          timeout: 10000,
          headers: {
            "User-Agent": "TenderMarketplace/1.0",
          },
        }
      );
      return response.data.releases || [];
    } catch (error) {
      console.log(
        "Canadian Open Contracting API not accessible, using mock data"
      );
      return [];
    }
  }

  getMockCanadianTenders() {
    return [
      {
        id: "ca-001-" + Date.now(),
        title: "Digital Government Services Platform - Federal",
        description:
          "Development of a comprehensive digital platform for federal government services delivery, including citizen portal, API management, cloud infrastructure, and bilingual support capabilities.",
        country: "Canada",
        region: "Federal",
        budget: 7200000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Digital Services",
        requirements: [
          "Cloud Computing",
          "API Development",
          "Security",
          "Bilingual Support",
          "Accessibility",
        ],
        status: "open",
        source: "BuyandSell.gc.ca",
        sourceUrl: "https://buyandsell.gc.ca",
        contactInfo: {
          department: "Shared Services Canada",
          phone: "+1-613-555-0123",
          email: "procurement@ssc-spc.gc.ca",
        },
        location: {
          city: "Ottawa",
          province: "Ontario",
          country: "Canada",
          coordinates: { lat: 45.4215, lng: -75.6972 },
        },
      },
      {
        id: "ca-002-" + Date.now(),
        title: "Healthcare Data Analytics Solution - Ontario",
        description:
          "Implementation of advanced analytics platform for healthcare data processing across Ontario, including AI-powered insights, privacy compliance, and integration with existing health systems.",
        country: "Canada",
        region: "Ontario",
        budget: 4800000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Healthcare Technology",
        requirements: [
          "Healthcare IT",
          "Data Analytics",
          "AI/ML",
          "Privacy Compliance",
          "System Integration",
        ],
        status: "open",
        source: "BuyandSell.gc.ca",
        sourceUrl: "https://buyandsell.gc.ca",
        contactInfo: {
          department: "Health Canada",
          phone: "+1-416-555-0124",
          email: "procurement@hc-sc.gc.ca",
        },
        location: {
          city: "Toronto",
          province: "Ontario",
          country: "Canada",
          coordinates: { lat: 43.6532, lng: -79.3832 },
        },
      },
      {
        id: "ca-003-" + Date.now(),
        title: "Smart Transportation Infrastructure - Vancouver",
        description:
          "Development of intelligent transportation system for Greater Vancouver area, including traffic optimization, public transit integration, and environmental impact monitoring.",
        country: "Canada",
        region: "British Columbia",
        budget: 9500000,
        deadline: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Transportation Technology",
        requirements: [
          "IoT",
          "Transportation Systems",
          "Data Analytics",
          "Environmental Monitoring",
          "System Integration",
        ],
        status: "open",
        source: "BuyandSell.gc.ca",
        sourceUrl: "https://buyandsell.gc.ca",
        contactInfo: {
          department: "Transport Canada",
          phone: "+1-604-555-0125",
          email: "procurement@tc.gc.ca",
        },
        location: {
          city: "Vancouver",
          province: "British Columbia",
          country: "Canada",
          coordinates: { lat: 49.2827, lng: -123.1207 },
        },
      },
      {
        id: "ca-004-" + Date.now(),
        title: "Cybersecurity Operations Center - Quebec",
        description:
          "Establishment of provincial cybersecurity operations center for Quebec government agencies, including threat monitoring, incident response, and security awareness training programs.",
        country: "Canada",
        region: "Quebec",
        budget: 5600000,
        deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Cybersecurity",
        requirements: [
          "Cybersecurity",
          "Incident Response",
          "Security Monitoring",
          "Bilingual Support",
          "Training",
        ],
        status: "open",
        source: "BuyandSell.gc.ca",
        sourceUrl: "https://buyandsell.gc.ca",
        contactInfo: {
          department: "Government of Quebec",
          phone: "+1-514-555-0126",
          email: "approvisionnement@quebec.ca",
        },
        location: {
          city: "Montreal",
          province: "Quebec",
          country: "Canada",
          coordinates: { lat: 45.5017, lng: -73.5673 },
        },
      },
    ];
  }

  transformTenders(data) {
    return data.map((tender) => ({
      id: tender.ocid || tender.id || `ca-${Date.now()}-${Math.random()}`,
      title: tender.tender?.title || tender.title,
      description:
        tender.tender?.description ||
        tender.description ||
        "No description available",
      country: "Canada",
      region: this.extractRegion(tender),
      budget: this.extractBudget(tender.tender?.value?.amount),
      deadline: tender.tender?.tenderPeriod?.endDate,
      category: tender.tender?.mainProcurementCategory || "General",
      requirements: this.extractRequirements(tender.tender?.description),
      status: "open",
      source: "Open Contracting Canada",
      sourceUrl: tender.uri,
      contactInfo: tender.parties?.[0] || {},
      location: this.extractLocation(tender),
      originalData: tender,
    }));
  }

  extractBudget(amount) {
    if (!amount) return null;
    return parseFloat(amount) || null;
  }

  extractRegion(tender) {
    // Try to extract province/territory from tender data
    const location = tender.tender?.deliveryLocation || tender.location;
    if (location && location.description) {
      if (location.description.includes("Ontario")) return "Ontario";
      if (location.description.includes("Quebec")) return "Quebec";
      if (location.description.includes("British Columbia"))
        return "British Columbia";
      if (location.description.includes("Alberta")) return "Alberta";
    }
    return "Federal";
  }

  extractLocation(tender) {
    const location = tender.tender?.deliveryLocation || {};
    return {
      city: location.city || "Ottawa",
      province: location.province || "Ontario",
      country: "Canada",
      coordinates: { lat: 45.4215, lng: -75.6972 }, // Default to Ottawa
    };
  }

  extractRequirements(description) {
    if (!description) return [];
    const keywords = [
      "Digital",
      "Technology",
      "Software",
      "Cloud",
      "AI",
      "Data",
      "Security",
      "Healthcare",
      "IoT",
    ];
    return keywords.filter((keyword) =>
      description.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

module.exports = CanadaTendersAPI;
