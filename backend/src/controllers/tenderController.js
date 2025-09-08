const TenderService = require("../services/tenderService");
const CompanyService = require("../services/companyService");
const TenderAggregatorService = require("../services/tenderAggregatorService");

class TenderController {
  constructor() {
    this.aggregatorService = new TenderAggregatorService();
  }

  // Enhanced search tenders with government APIs
  async searchTenders(req, res) {
    try {
      const {
        q: query,
        country,
        category,
        limit = 10,
        page = 1,
        countries,
        minBudget,
        maxBudget,
        region,
        requirements,
        useGovernmentAPIs = true,
      } = req.query;

      // If using government APIs for enhanced search
      if (useGovernmentAPIs && (countries || query)) {
        const countryList = countries
          ? countries.split(",").map((c) => c.toLowerCase().trim())
          : country
          ? [country.toLowerCase()]
          : ["usa", "uk", "canada", "australia"];

        const filters = {
          category,
          minBudget,
          maxBudget,
          region,
          requirements: requirements
            ? requirements.split(",").map((r) => r.trim())
            : [],
        };

        const governmentTenders = await this.aggregatorService.searchTenders(
          query,
          countryList,
          filters
        );

        // Apply pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const paginatedTenders = governmentTenders.slice(
          offset,
          offset + parseInt(limit)
        );

        return res.json({
          success: true,
          data: paginatedTenders,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: governmentTenders.length,
            hasMore: offset + parseInt(limit) < governmentTenders.length,
          },
          source: "government_apis",
          countries: countryList,
        });
      }

      // Fallback to original tender service
      let tenders;
      if (query) {
        tenders = await TenderService.searchTenders(query, {
          limit: parseInt(limit),
          country,
          category,
        });
      } else {
        const result = await TenderService.getTenders({
          limit: parseInt(limit),
          country,
          category,
        });
        tenders = result.tenders;
      }

      res.json({
        success: true,
        data: tenders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tenders.length,
        },
        source: "database",
      });
    } catch (error) {
      console.error("Search tenders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search tenders",
        error: error.message,
      });
    }
  }

  // Get recommendations for authenticated user (enhanced with government APIs)
  async getRecommendations(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const { limit = 10, useGovernmentAPIs = true } = req.query;

      // Get user's company profile
      const company = await CompanyService.getCompanyByUserId(userId);
      if (!company) {
        return res.status(404).json({
          success: false,
          message:
            "Company profile not found. Please complete your profile first.",
        });
      }

      let recommendations;

      // Use government APIs for enhanced recommendations
      if (useGovernmentAPIs) {
        const companyProfile = {
          companyName: company.company_name,
          capabilities: company.capabilities || [],
          experience: company.experience || [],
          countries: company.countries || ["usa"],
          budget: company.budget || null,
        };

        recommendations = await this.aggregatorService.getRecommendations(
          companyProfile
        );

        // Limit results
        recommendations = recommendations.slice(0, parseInt(limit));
      } else {
        // Fallback to original service
        recommendations = await TenderService.getRecommendations(
          company,
          parseInt(limit)
        );
      }

      res.json({
        success: true,
        data: recommendations,
        company_profile: {
          id: company.id,
          name: company.company_name,
          capabilities: company.capabilities,
          countries: company.countries,
        },
        source: useGovernmentAPIs ? "government_apis" : "database",
      });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recommendations",
        error: error.message,
      });
    }
  }

  // Get tenders from specific country using government APIs
  async getTendersByCountry(req, res) {
    try {
      const { country } = req.params;
      const { limit = 50 } = req.query;

      console.log(`🌍 Fetching tenders for country: ${country}`);

      const tenders = await this.aggregatorService.getTendersByCountry(country);

      // Apply limit
      const limitedTenders = tenders.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: {
          country: country.toUpperCase(),
          tenders: limitedTenders,
          count: limitedTenders.length,
          total: tenders.length,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching country tenders:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get tenders by location (city, state, region)
  async getTendersByLocation(req, res) {
    try {
      const { location } = req.params;
      const { limit = 50 } = req.query;

      console.log(`📍 Fetching tenders for location: ${location}`);

      const tenders = await this.aggregatorService.getTendersByLocation(
        location
      );

      // Apply limit
      const limitedTenders = tenders.slice(0, parseInt(limit));

      res.json({
        success: true,
        data: {
          location,
          tenders: limitedTenders,
          count: limitedTenders.length,
          total: tenders.length,
        },
      });
    } catch (error) {
      console.error("❌ Error fetching location tenders:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching tenders by location",
        error: error.message,
      });
    }
  }

  // Get available countries with government APIs
  async getCountries(req, res) {
    try {
      const countries = await this.aggregatorService.getCountriesWithTenders();

      res.json({
        success: true,
        data: {
          countries,
          count: countries.length,
        },
      });
    } catch (error) {
      console.error("❌ Error getting countries:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching countries",
        error: error.message,
      });
    }
  }

  // Get tender by ID
  async getTenderById(req, res) {
    try {
      const { id } = req.params;

      const tender = await TenderService.getTenderById(id);
      if (!tender) {
        return res.status(404).json({
          success: false,
          message: "Tender not found",
        });
      }

      res.json({
        success: true,
        data: tender,
      });
    } catch (error) {
      console.error("Get tender error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get tender",
        error: error.message,
      });
    }
  }

  // Create new tender (admin only)
  async createTender(req, res) {
    try {
      const tenderData = req.body;

      // Validate required fields
      if (!tenderData.title || !tenderData.description) {
        return res.status(400).json({
          success: false,
          message: "Title and description are required",
        });
      }

      const tender = await TenderService.createTender(tenderData);

      res.status(201).json({
        success: true,
        data: tender,
        message: "Tender created successfully",
      });
    } catch (error) {
      console.error("Create tender error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create tender",
        error: error.message,
      });
    }
  }

  // Update tender (admin only)
  async updateTender(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const tender = await TenderService.updateTender(id, updateData);
      if (!tender) {
        return res.status(404).json({
          success: false,
          message: "Tender not found",
        });
      }

      res.json({
        success: true,
        data: tender,
        message: "Tender updated successfully",
      });
    } catch (error) {
      console.error("Update tender error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update tender",
        error: error.message,
      });
    }
  }

  // Delete tender (admin only)
  async deleteTender(req, res) {
    try {
      const { id } = req.params;

      const success = await TenderService.deleteTender(id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Tender not found",
        });
      }

      res.json({
        success: true,
        message: "Tender deleted successfully",
      });
    } catch (error) {
      console.error("Delete tender error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete tender",
        error: error.message,
      });
    }
  }

  // Trigger scraping (admin only)
  async triggerScraping(req, res) {
    try {
      const { sources = ["usa", "uk", "singapore"] } = req.body;

      // This would trigger your scraping services
      const ScrapingService = require("../services/scrapingService");

      const results = [];
      for (const source of sources) {
        try {
          const scrapedTenders = await ScrapingService.scrapeSource(source);
          const savedTenders = await TenderService.bulkCreateTenders(
            scrapedTenders
          );
          results.push({
            source,
            count: savedTenders.length,
            tenders: savedTenders,
          });
        } catch (sourceError) {
          console.error(`Scraping error for ${source}:`, sourceError);
          results.push({
            source,
            error: sourceError.message,
            count: 0,
          });
        }
      }

      res.json({
        success: true,
        data: results,
        message: "Scraping completed",
      });
    } catch (error) {
      console.error("Trigger scraping error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to trigger scraping",
        error: error.message,
      });
    }
  }

  // Get tender statistics (enhanced with government APIs)
  async getTenderStats(req, res) {
    try {
      const { includeGovernmentAPIs = true } = req.query;

      let stats = {
        total_tenders: 0,
        active_tenders: 0,
        countries: [],
        categories: [],
        sources: [],
      };

      // Get database stats
      const allTenders = await TenderService.getTenders({ limit: 1000 });
      const dbStats = {
        total_tenders: allTenders.tenders.length,
        active_tenders: allTenders.tenders.filter((t) => t.status === "open")
          .length,
        countries: [
          ...new Set(allTenders.tenders.map((t) => t.country).filter(Boolean)),
        ],
        categories: [
          ...new Set(allTenders.tenders.map((t) => t.category).filter(Boolean)),
        ],
        source: "database",
      };

      stats = { ...dbStats };

      // Include government API stats if requested
      if (includeGovernmentAPIs) {
        try {
          const govStats = await this.aggregatorService.getTenderStats();

          stats = {
            total_tenders: dbStats.total_tenders + govStats.totalTenders,
            active_tenders: dbStats.active_tenders + govStats.activeTenders,
            countries: [
              ...new Set([...dbStats.countries, ...govStats.countries]),
            ],
            categories: [
              ...new Set([...dbStats.categories, ...govStats.categories]),
            ],
            sources: ["database", "government_apis"],
            breakdown: {
              database: {
                total: dbStats.total_tenders,
                active: dbStats.active_tenders,
                countries: dbStats.countries,
                categories: dbStats.categories,
              },
              government_apis: {
                total: govStats.totalTenders,
                active: govStats.activeTenders,
                countries: govStats.countries,
                categories: govStats.categories,
                by_country: govStats.byCountry,
              },
            },
          };
        } catch (govError) {
          console.warn("Government API stats unavailable:", govError.message);
          stats.sources = ["database"];
          stats.government_api_error = govError.message;
        }
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get tender stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get tender statistics",
        error: error.message,
      });
    }
  }
}

module.exports = new TenderController();
