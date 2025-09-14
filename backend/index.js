import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import tenderRoutes from "./routes/tenderRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();
console.log("🔑 Groq Key Loaded:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.slice(0, 8) + "..." : "❌ NOT FOUND");
console.log("📦 Mongo URI Loaded:", process.env.MONGO_CONN ? "✅ Found" : "❌ NOT FOUND");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tenders", tenderRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/profile", profileRoutes);

// Health check
app.get("/", (req, res) => res.send("Tender App Backend Running"));

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_CONN, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(5000, () => console.log("✅ Server running on port 5000"));
})
.catch(err => console.error("❌ MongoDB connection error:", err));
