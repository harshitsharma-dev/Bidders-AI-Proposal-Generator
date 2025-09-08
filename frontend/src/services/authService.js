// Firebase Authentication Service
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBkKQqOJX0234567890abcdef",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "tender-market-a6593.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tender-market-a6593",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    "tender-market-a6593.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

class AuthService {
  constructor() {
    this.auth = auth;
    this.db = db;
  }

  // Sign up with email and password
  async signUp(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile with display name
      if (userData.displayName) {
        await updateProfile(user, {
          displayName: userData.displayName,
        });
      }

      // Create user document in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || "",
        companyName: userData.companyName || "",
        role: userData.role || "bidder",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profile: {
          ...userData,
          completedProjects: 0,
          successRate: 0,
          totalRevenue: 0,
          activeProposals: 0,
          recentWins: 0,
          capabilities: userData.capabilities || [],
          countries: userData.countries || [],
          subscription: {
            plan: "free",
            status: "active",
            expiresAt: null,
          },
        },
      };

      await setDoc(doc(this.db, "users", user.uid), userDoc);

      return {
        success: true,
        user: user,
        userData: userDoc,
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update last login time
      await this.updateLastLogin(user.uid);

      // Get user data from Firestore
      const userData = await this.getUserData(user.uid);

      return {
        success: true,
        user: user,
        userData: userData,
      };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(this.auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      let userData = await this.getUserData(user.uid);

      if (!userData) {
        // Create new user document
        userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          companyName: "",
          role: "bidder",
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profile: {
            completedProjects: 0,
            successRate: 0,
            totalRevenue: 0,
            activeProposals: 0,
            recentWins: 0,
            capabilities: [],
            countries: [],
            subscription: {
              plan: "free",
              status: "active",
              expiresAt: null,
            },
          },
        };
        await setDoc(doc(this.db, "users", user.uid), userData);
      } else {
        // Update last login
        await this.updateLastLogin(user.uid);
      }

      return {
        success: true,
        user: user,
        userData: userData,
      };
    } catch (error) {
      console.error("Google sign in error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(this.db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Get user data error:", error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid, profileData) {
    try {
      const userRef = doc(this.db, "users", uid);
      await updateDoc(userRef, {
        profile: profileData,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Update last login time
  async updateLastLogin(uid) {
    try {
      const userRef = doc(this.db, "users", uid);
      await updateDoc(userRef, {
        lastLoginAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Update last login error:", error);
    }
  }

  // Monitor authentication state
  onAuthStateChanged(callback) {
    return onAuthStateChanged(this.auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.auth.currentUser;
  }
}

export default new AuthService();
