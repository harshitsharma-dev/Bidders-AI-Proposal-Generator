const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// In-memory user storage (replace with database in production)
const users = new Map();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "tenderforge-secret-key-2025",
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};

// Register new user
router.post("/register", async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      companyName,
      capabilities = [],
      countries = [],
    } = req.body;

    // Input validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and full name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    if (users.has(email.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      companyName: companyName || `${fullName} Solutions`,
      capabilities,
      countries,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      role: "user",
      isActive: true,
      profile: {
        completedProjects: 0,
        successRate: 0,
        totalRevenue: 0,
        activeProposals: 0,
        recentWins: 0,
      },
    };

    users.set(email.toLowerCase(), user);

    // Generate JWT token
    const token = generateToken(user);

    console.log(`✅ New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          companyName: user.companyName,
          capabilities: user.capabilities,
          countries: user.countries,
          role: user.role,
          profile: user.profile,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = users.get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    users.set(email.toLowerCase(), user);

    // Generate JWT token
    const token = generateToken(user);

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          companyName: user.companyName,
          capabilities: user.capabilities,
          countries: user.countries,
          role: user.role,
          profile: user.profile,
          lastLogin: user.lastLogin,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Verify token and get user info
router.get("/me", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tenderforge-secret-key-2025"
    );
    const user = Array.from(users.values()).find(
      (u) => u.id === decoded.userId
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          companyName: user.companyName,
          capabilities: user.capabilities,
          countries: user.countries,
          role: user.role,
          profile: user.profile,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// Refresh token
router.post("/refresh", (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token (even if expired, we can refresh)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tenderforge-secret-key-2025",
      {
        ignoreExpiration: true,
      }
    );

    const user = Array.from(users.values()).find(
      (u) => u.id === decoded.userId
    );

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new token
    const newToken = generateToken(user);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: "Token refresh failed",
    });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tenderforge-secret-key-2025"
    );
    const user = Array.from(users.values()).find(
      (u) => u.id === decoded.userId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const { fullName, companyName, capabilities, countries } = req.body;

    // Update user data
    if (fullName) user.fullName = fullName;
    if (companyName) user.companyName = companyName;
    if (capabilities) user.capabilities = capabilities;
    if (countries) user.countries = countries;

    users.set(user.email, user);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          companyName: user.companyName,
          capabilities: user.capabilities,
          countries: user.countries,
          role: user.role,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Profile update failed",
    });
  }
});

// Logout (client-side will remove token)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// Get all users (admin only - for testing)
router.get("/users", (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      success: false,
      message: "Not available in production",
    });
  }

  const userList = Array.from(users.values()).map((user) => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    companyName: user.companyName,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    isActive: user.isActive,
  }));

  res.json({
    success: true,
    data: {
      users: userList,
      total: userList.length,
    },
  });
});

module.exports = router;
