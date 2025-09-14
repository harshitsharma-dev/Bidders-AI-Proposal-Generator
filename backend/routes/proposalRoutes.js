// routes/proposalRoutes.js
import express from "express";
import { 
  submitProposal, 
  getMyProposals, 
  getProposalsWithTender, 
  editProposalAI, 
  getProposalById 
} from "../controllers/proposalController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Submit a new proposal
router.post("/", authMiddleware, submitProposal);

// Get all proposals of logged-in user
router.get("/my", authMiddleware, getMyProposals);

// Get proposals for a specific tender (for dashboard)
router.get("/tender/:tenderId", authMiddleware, getProposalsWithTender);

// Edit proposal using AI
router.put("/:id/edit-ai", authMiddleware, editProposalAI);

// ✅ Get a single proposal by ID
router.get("/:id", authMiddleware, getProposalById);

export default router;
