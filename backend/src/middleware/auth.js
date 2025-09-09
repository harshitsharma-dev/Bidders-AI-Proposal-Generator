const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

// Create rate limiter for proposal generation
const proposalRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 2, // Maximum 2 requests per hour per user
  message: {
    error: "Rate limit exceeded",
    message:
      "Too many proposal requests. You can generate maximum 2 proposals per hour. Please try again later.",
    retryAfter: "1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create rate limiter for authentication routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 login attempts per IP per 15 minutes
  message: {
    error: "Too many authentication attempts",
    message: "Please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "Please provide a valid authentication token",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "No token provided",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tenderforge-secret-key-2025"
    );

    // Add user info to request object
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || "user",
    };

    console.log(`✅ Authenticated user: ${req.user.email} (${req.user.id})`);
    next();
  } catch (error) {
    // Suppress common JWT errors that are expected (old tokens, malformed tokens)
    const isCommonError =
      error.name === "JsonWebTokenError" &&
      (error.message.includes("malformed") ||
        error.message.includes("invalid signature"));

    if (!isCommonError) {
      console.error("Authentication error:", error.message);
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Your session has expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Invalid authentication token. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      error: "Authentication failed",
      message: "Authentication failed. Please login again.",
    });
  }
};

// Optional authentication middleware (for routes that work with or without auth)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tenderforge-secret-key-2025"
    );

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || "user",
    };

    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "Please login to access this resource",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied",
      message: "Admin access required",
    });
  }

  next();
};

module.exports = {
  authenticateUser,
  optionalAuth,
  requireAdmin,
  proposalRateLimit,
  authRateLimit,
};
