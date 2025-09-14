require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

// Import services
const geminiService = require("./services/geminiService");
const tenderService = require("./services/tenderService");
const companyService = require("./services/companyService");
// const paymentService = require("./services/paymentService");

// Import controllers
const TenderController = require("./controllers/tenderController");

// Import middleware
const { authenticateUser, optionalAuth } = require("./middleware/auth");

const app = express();

// Initialize services
const geminiServiceInstance = new geminiService();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API health check with service status
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      gemini: process.env.GEMINI_API_KEY ? "configured" : "missing_api_key",
      firebase: "connected",
      vector: process.env.GEMINI_API_KEY ? "configured" : "missing_api_key",
    },
  });
});

// List available Gemini models
app.get("/api/models", async (req, res) => {
  try {
    const models = [
      {
        name: "gemini-1.5-flash-latest", 
        description: "Fast and efficient for most tasks",
      },
      {
        name: "gemini-1.5-pro-latest", // Add backup model
        description: "More capable model for complex tasks",
      }
    ];

    res.json({
      success: true,
      models: models,
      current: "gemini-1.5-flash-latest",
    });
  } catch (error) {
    console.error("Error listing models:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Proposal generation endpoint
app.post("/api/proposals/generate", async (req, res) => {
  try {
    const { tender, company } = req.body;

    if (!tender || !company) {
      return res.status(400).json({
        success: false,
        message: "Missing tender or company data",
      });
    }

    console.log("Generating proposal with Gemini for:", tender.title);

    const proposal = await geminiServiceInstance.generateProposal(
      tender,
      company
    );

    res.json({
      success: true,
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      proposal: proposal,
      generatedAt: new Date().toISOString(),
      model: "gemini-1.5-flash-latest", // ✅ Correct model name
    });
  } catch (error) {
    console.error("Error generating proposal:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate proposal",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});
/*
app.post("/api/proposals/:id/edit", async (req, res) => {
  try {
      const proposalId = req.params.id;
      const { currentContent, userMessage } = req.body;
      // const userId = req.user.id

      if (!proposalId || !currentContent || !userMessage) {
        return res.status(400).json({
          success: false,
          message: "Proposal ID, currentContent and userMessage are required",
        })
      }

      console.log(`Editing proposal ${proposalId}`)

      const editPrompt = `
      You are editing a business proposal document.
Here is the current proposal:

${currentContent}

The user wants the following modifications:
"${userMessage}"

Please return the updated proposal text with ONLY the requested changes applied, while preserving the rest of the content, formatting, and professionalism.
      `
    // Call Gemini service
    const updatedContent = await geminiServiceInstance.generateText(editPrompt);

    const updatedProposal = {
      id: proposalId,
      content: updatedContent,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: "Proposal edited successfully",
      data: { proposal: updatedProposal },
    });
  } catch (error) {
    console.error("❌ Error editing proposal:", error);
    res.status(500).json({
      success: false,
      message: "Failed to edit proposal",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
*/

// Authentication routes (add before other routes)
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Proposal routes (add authentication)
const proposalRoutes = require("./routes/proposals");
app.use("/api/proposals", proposalRoutes);

// Subscription routes
const subscriptionRoutes = require("./routes/subscriptions");
app.use("/api/subscriptions", subscriptionRoutes);

// Tender routes
app.post("/api/tenders", async (req, res) => {
  try {
    const tender = await tenderService.createTender(req.body);
    res.json({ success: true, tender });
  } catch (error) {
    console.error("Error creating tender:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/tenders", async (req, res) => {
  try {
    const tenders = await tenderService.getTenders(req.query);
    res.json({ success: true, tenders });
  } catch (error) {
    console.error("Error getting tenders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Government API routes - these should come before the general routes
app.get("/api/tenders/search", authenticateUser, (req, res) =>
  TenderController.searchTenders(req, res)
);
app.get("/api/tenders/recommendations", authenticateUser, (req, res) =>
  TenderController.getRecommendations(req, res)
);
app.get("/api/tenders/stats", authenticateUser, (req, res) =>
  TenderController.getTenderStats(req, res)
);
app.get("/api/tenders/country/:country", authenticateUser, (req, res) =>
  TenderController.getTendersByCountry(req, res)
);
app.get("/api/tenders/location/:location", authenticateUser, (req, res) =>
  TenderController.getTendersByLocation(req, res)
);
app.get("/api/tenders/api/countries", authenticateUser, (req, res) =>
  TenderController.getCountries(req, res)
);

// Original vector search (keep for backward compatibility)
app.post("/api/tenders/search", async (req, res) => {
  try {
    const { query, limit } = req.body;
    const results = await tenderService.searchSimilarTenders(query, limit);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Error searching tenders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/tenders/:id", authenticateUser, (req, res) =>
  TenderController.getTenderById(req, res)
);

// Company routes
app.put("/api/companies/profile", async (req, res) => {
  try {
    const profile = await companyService.updateCompany(req.body);
    res.json({ success: true, profile });
  } catch (error) {
    console.error("Error updating company profile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* Payment routes
app.post("/api/payments/create-intent", async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const paymentIntent = await paymentService.createPaymentIntent(
      amount,
      currency,
      metadata
    );

    res.json({
      success: true,
      ...paymentIntent,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment intent",
    });
  }
});

app.post("/api/payments/create-customer", async (req, res) => {
  try {
    const { email, name, companyName } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: "Email and name are required",
      });
    }

    const customer = await paymentService.createCustomer(
      email,
      name,
      companyName
    );

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create customer",
    });
  }
});

app.post("/api/payments/create-subscription", async (req, res) => {
  try {
    const { customerId, priceId, metadata } = req.body;

    if (!customerId || !priceId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and price ID are required",
      });
    }

    const subscription = await paymentService.createSubscription(
      customerId,
      priceId,
      metadata
    );

    res.json({
      success: true,
      ...subscription,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create subscription",
    });
  }
});

app.get("/api/payments/history/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const history = await paymentService.getPaymentHistory(customerId);

    res.json({
      success: true,
      payments: history,
    });
  } catch (error) {
    console.error("Error getting payment history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get payment history",
    });
  }
});

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        event = paymentService.stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      await paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to handle webhook",
      });
    }
  }
);
*/
// Basic route
app.get("/api", (req, res) => {
  res.json({
    message: "Tender Marketplace API",
    version: "1.0.0",
    endpoints: [
      "GET /health - Health check",
      "GET /api/health - API health with service status",
      "POST /api/proposals/generate - Generate AI proposal",
      "GET /api/tenders - Get tenders",
      "POST /api/tenders - Create tender",
      "POST /api/tenders/search - Search similar tenders",
      "PUT /api/companies/profile - Update company profile",
    ],
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 API info: http://localhost:${PORT}/api`);
  console.log(
    `🤖 Gemini: ${
      process.env.GEMINI_API_KEY ? "Configured" : "Missing API Key"
    }`
  );
  console.log(
    `🔥 Firebase: ${
      process.env.FIREBASE_PROJECT_ID ? "Configured" : "Missing Config"
    }`
  );
});

module.exports = app;
