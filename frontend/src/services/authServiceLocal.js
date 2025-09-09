// Local Authentication Service for Development
// This simulates Firebase authentication for development/demo purposes

class LocalAuthService {
  constructor() {
    this.users = JSON.parse(localStorage.getItem("tender_users") || "{}");
    this.currentUser = JSON.parse(
      localStorage.getItem("tender_current_user") || "null"
    );
    this.isInitialized = true;
  }

  // Save users to localStorage
  saveUsers() {
    localStorage.setItem("tender_users", JSON.stringify(this.users));
  }

  // Save current user to localStorage
  saveCurrentUser(user) {
    localStorage.setItem("tender_current_user", JSON.stringify(user));
    this.currentUser = user;
  }

  // Clear current user
  clearCurrentUser() {
    localStorage.removeItem("tender_current_user");
    this.currentUser = null;
  }

  // Sign up with email and password
  async signUp(email, password, userData) {
    try {
      // Check if user already exists
      if (this.users[email]) {
        return {
          success: false,
          error: "User already exists with this email",
        };
      }

      // Create new user
      const userId =
        "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      const user = {
        uid: userId,
        email: email,
        displayName: userData.displayName || "User",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      const userProfile = {
        uid: userId,
        email: email,
        displayName: userData.displayName || "User",
        companyName: userData.companyName || "Personal",
        role: userData.role || "Bidder/Contractor",
        capabilities: userData.capabilities || [],
        countries: userData.countries || ["United States"],
        subscription: "free",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profileComplete: true,
        // User statistics for personalized dashboard
        activeProposals: Math.floor(Math.random() * 10) + 1,
        recentWins: Math.floor(Math.random() * 5),
        successRate: Math.floor(Math.random() * 40) + 60,
        totalRevenue: Math.floor(Math.random() * 5000000) + 1000000,
        completedProjects: Math.floor(Math.random() * 50) + 10,
        averageRating: (Math.random() * 1 + 4).toFixed(1),
      };

      // Store user
      this.users[email] = {
        user: user,
        userData: userProfile,
        password: this.hashPassword(password), // In real app, never store plaintext passwords
      };

      this.saveUsers();
      this.saveCurrentUser(user);

      return {
        success: true,
        user: user,
        userData: userProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to create account",
      };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userData = this.users[email];
      if (!userData) {
        return {
          success: false,
          error: "No account found with this email",
        };
      }

      if (userData.password !== this.hashPassword(password)) {
        return {
          success: false,
          error: "Invalid password",
        };
      }

      // Update last login
      userData.userData.lastLogin = new Date().toISOString();
      this.saveUsers();
      this.saveCurrentUser(userData.user);

      return {
        success: true,
        user: userData.user,
        userData: userData.userData,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to sign in",
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      this.clearCurrentUser();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to sign out",
      };
    }
  }

  // Google Sign In (simulated)
  async signInWithGoogle() {
    try {
      const email = "demo@google.com";
      const userId = "google_user_" + Date.now();

      const user = {
        uid: userId,
        email: email,
        displayName: "Google Demo User",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      const userProfile = {
        uid: userId,
        email: email,
        displayName: "Google Demo User",
        companyName: "Google Inc.",
        role: "Bidder/Contractor",
        capabilities: ["Cloud Computing", "AI/ML", "Data Analytics"],
        countries: ["United States"],
        subscription: "pro",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profileComplete: true,
        activeProposals: 8,
        recentWins: 3,
        successRate: 87,
        totalRevenue: 3500000,
        completedProjects: 25,
        averageRating: 4.8,
      };

      this.saveCurrentUser(user);

      return {
        success: true,
        user: user,
        userData: userProfile,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to sign in with Google",
      };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is signed in
  isSignedIn() {
    return !!this.currentUser;
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: "No user signed in",
        };
      }

      const userRecord = this.users[this.currentUser.email];
      if (userRecord) {
        userRecord.userData = { ...userRecord.userData, ...updates };
        this.saveUsers();

        return {
          success: true,
          userData: userRecord.userData,
        };
      }

      return {
        success: false,
        error: "User not found",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Failed to update profile",
      };
    }
  }

  // Get user data by UID
  async getUserData(uid) {
    try {
      const user = Object.values(this.users).find((u) => u.user.uid === uid);
      return user ? user.userData : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Simple password hashing (for demo only - use proper hashing in production)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Auth state observer (simulated)
  onAuthStateChanged(callback) {
    // Simulate immediate callback with current user
    setTimeout(() => {
      callback(this.currentUser);
    }, 100);

    // Return unsubscribe function
    return () => {};
  }
}

// Create singleton instance
const localAuthService = new LocalAuthService();

export default localAuthService;
