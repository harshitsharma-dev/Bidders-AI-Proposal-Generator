// API service for connecting to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        // Add a mock authorization header for testing
        Authorization: "Bearer mock_token_for_testing",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Generate AI proposal using Gemini
  async generateProposal(tenderData, companyProfile) {
    return this.makeRequest("/api/proposals/generate", {
      method: "POST",
      body: JSON.stringify({
        tender: tenderData,
        company: companyProfile,
      }),
    });
  }

  // Store tender in Firebase
  async storeTender(tenderData) {
    return this.makeRequest("/api/tenders", {
      method: "POST",
      body: JSON.stringify(tenderData),
    });
  }

  // Get tenders from Firebase
  async getTenders(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.makeRequest(
      `/api/tenders${queryParams ? `?${queryParams}` : ""}`
    );
  }

  // Store company profile
  async updateCompanyProfile(profileData) {
    return this.makeRequest("/api/companies/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Search similar tenders using vector embeddings
  async searchSimilarTenders(query, limit = 10) {
    return this.makeRequest("/api/tenders/search", {
      method: "POST",
      body: JSON.stringify({ query, limit }),
    });
  }

  // Government API methods
  async searchGovernmentTenders(query, countries = [], filters = {}) {
    const params = new URLSearchParams({
      q: query || "",
      countries: countries.join(","),
      useGovernmentAPIs: "true",
      ...filters,
    });

    return this.makeRequest(`/api/tenders/search?${params.toString()}`);
  }

  async getTendersByCountry(country, limit = 50) {
    return this.makeRequest(`/api/tenders/country/${country}?limit=${limit}`);
  }

  async getTendersByLocation(location, limit = 50) {
    return this.makeRequest(
      `/api/tenders/location/${encodeURIComponent(location)}?limit=${limit}`
    );
  }

  async getAvailableCountries() {
    return this.makeRequest("/api/tenders/api/countries");
  }

  async getTenderRecommendations(useGovernmentAPIs = true) {
    return this.makeRequest(
      `/api/tenders/recommendations?useGovernmentAPIs=${useGovernmentAPIs}`
    );
  }

  async getTenderStats(includeGovernmentAPIs = true) {
    return this.makeRequest(
      `/api/tenders/stats?includeGovernmentAPIs=${includeGovernmentAPIs}`
    );
  }
}

export default new ApiService();
