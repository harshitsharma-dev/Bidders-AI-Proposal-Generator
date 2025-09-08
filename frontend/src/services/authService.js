// JWT Authentication Service for TenderForge
class AuthService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
    this.token = localStorage.getItem("tenderforge_token");
    this.user = null;

    // Initialize user from stored token
    if (this.token) {
      this.verifyToken();
    }
  }

  // Store token and user data
  setAuthData(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem("tenderforge_token", token);
    localStorage.setItem("tenderforge_user", JSON.stringify(user));
  }

  // Clear auth data
  clearAuthData() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("tenderforge_token");
    localStorage.removeItem("tenderforge_user");
  }

  // Get stored user data
  getStoredUser() {
    const userData = localStorage.getItem("tenderforge_user");
    return userData ? JSON.parse(userData) : null;
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.success) {
        this.setAuthData(data.data.token, data.data.user);
        return data.data.user;
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.success) {
        this.setAuthData(data.data.token, data.data.user);
        return data.data.user;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout user
  async logout() {
    try {
      if (this.token) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuthData();
    }
  }

  // Verify current token and get user data
  async verifyToken() {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.user = data.data.user;
        localStorage.setItem("tenderforge_user", JSON.stringify(this.user));
        return this.user;
      } else {
        // Token is invalid, clear auth data
        this.clearAuthData();
        return null;
      }
    } catch (error) {
      console.error("Token verification error:", error);
      this.clearAuthData();
      return null;
    }
  }

  // Refresh token
  async refreshToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.token = data.data.token;
        localStorage.setItem("tenderforge_token", this.token);
        return true;
      } else {
        this.clearAuthData();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearAuthData();
      return false;
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    if (!this.token) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      if (data.success) {
        this.user = data.data.user;
        localStorage.setItem("tenderforge_user", JSON.stringify(this.user));
        return this.user;
      } else {
        throw new Error(data.message || "Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user || this.getStoredUser();
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!(this.token && (this.user || this.getStoredUser()));
  }

  // Get authorization header for API requests
  getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // Make authenticated API request
  async authenticatedRequest(url, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry request with new token
        headers.Authorization = `Bearer ${this.token}`;
        return fetch(url, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, redirect to login
        this.clearAuthData();
        window.location.href = "/login";
        throw new Error("Session expired");
      }
    }

    return response;
  }

  // Authentication state listener (for React components)
  onAuthStateChanged(callback) {
    // Check current state
    callback(this.getCurrentUser());

    // Set up periodic token verification
    const interval = setInterval(async () => {
      const user = await this.verifyToken();
      callback(user);
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Return cleanup function
    return () => clearInterval(interval);
  }

  // Legacy method compatibility for existing components
  async signUp(email, password, userData) {
    return this.register({
      email,
      password,
      fullName:
        userData.fullName || `${userData.firstName} ${userData.lastName}`,
      companyName: userData.companyName,
      capabilities: userData.capabilities,
      countries: userData.countries,
    });
  }

  // Legacy method compatibility for existing components
  async signIn(email, password) {
    return this.login(email, password);
  }

  // Legacy method compatibility for existing components
  async signOut() {
    return this.logout();
  }

  // Legacy method compatibility for existing components
  async getUserData(uid) {
    return this.getCurrentUser();
  }

  // Legacy method compatibility for existing components
  async updateUserProfile(uid, profileData) {
    return this.updateProfile(profileData);
  }

  // Error message mapping for compatibility
  getFirebaseErrorMessage(errorCode) {
    const errorMessages = {
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/operation-not-allowed": "Email/password accounts are not enabled.",
      "auth/weak-password": "Password should be at least 6 characters.",
      "auth/user-disabled": "This user account has been disabled.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/too-many-requests":
        "Too many failed login attempts. Please try again later.",
    };

    return errorMessages[errorCode] || "An error occurred. Please try again.";
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;

// Also export the class for direct instantiation if needed
export { AuthService };
