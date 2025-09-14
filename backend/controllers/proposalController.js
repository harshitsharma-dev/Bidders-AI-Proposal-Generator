// controllers/proposalController.js
import Proposal from "../models/Proposal.js";
import Tender from "../models/Tender.js";
import Profile from "../models/Profile.js";
import { calculateRank } from "../utils/ranking.js";
import cron from "node-cron";
import axios from "axios";

// ========================
// Submit a new proposal
// ========================
export const submitProposal = async (req, res) => {
  try {
    const { tenderId, budget, timeline, materials } = req.body;
    const userId = req.user.id;

    const tender = await Tender.findById(tenderId);
    if (!tender) return res.status(404).json({ msg: "Tender not found" });

    const profile = await Profile.findOne({ user: userId });
    if (!profile) return res.status(400).json({ msg: "Complete your profile first" });

    const proposal = new Proposal({
      userId,
      tenderId,
      budget,
      timeline,
      materials,
      rank: null,
      status: "pending",
    });

    await proposal.save();
    res.json(proposal);
  } catch (err) {
    console.error("submitProposal error:", err);
    res.status(500).json({ msg: "Error submitting proposal" });
  }
};

// ========================
// Get all proposals of logged-in user
// ========================
export const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ userId: req.user.id }).populate("tenderId");
    res.json(proposals);
  } catch (err) {
    console.error("getMyProposals error:", err);
    res.status(500).json({ msg: "Error fetching proposals" });
  }
};

// ========================
// Get proposals with tender info (dashboard)
// ========================
export const getProposalsWithTender = async (req, res) => {
  try {
    const proposals = await Proposal.find({ userId: req.user.id })
      .populate("tenderId", "title deadline");
    res.json(proposals);
  } catch (err) {
    console.error("getProposalsWithTender error:", err);
    res.status(500).json({ msg: "Error fetching proposals with tender" });
  }
};

// ========================
// Get a single proposal by ID
// ========================
export const getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate("tenderId");
    if (!proposal) return res.status(404).json({ msg: "Proposal not found" });
    res.json(proposal);
  } catch (err) {
    console.error("getProposalById error:", err);
    res.status(500).json({ msg: "Error fetching proposal" });
  }
};

// ========================
// Edit proposal using Groq AI (field-specific)
// ========================
export const editProposalAI = async (req, res) => {
  try {
    console.log("Editing Proposal Called..");

    const proposalId = req.params.id;
    const { message } = req.body; // must be { message: "..." } from frontend

    console.log("Message received:", message);

    if (!message || message.trim() === "") {
      return res.status(400).json({ msg: "No changes provided" });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) return res.status(404).json({ msg: "Proposal not found" });

    const prompt = `
Current Proposal:
Budget: ${proposal.budget}
Timeline: ${proposal.timeline} days
Materials: ${Array.isArray(proposal.materials) ? proposal.materials.join(", ") : proposal.materials || ""}

User requested changes:
${message}

Please provide only the updated value for the field you are modifying (budget, timeline, or materials). Respond concisely.
`;

    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are an assistant that only returns concise updates to proposal fields." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const updatedText = aiResponse.data.choices?.[0]?.message?.content?.trim();
    console.log("AI Response:", updatedText);

    let updatedFields = {};

    // Timeline update only if message includes "timeline"
    if (/timeline/i.test(message)) {
      const timelineMatch = updatedText.match(/(\d+)\s*days/i);
      if (timelineMatch) updatedFields.timeline = parseInt(timelineMatch[1]);
    }

    // Budget update only if message includes "budget"
    if (/budget/i.test(message)) {
      const budgetMatch = updatedText.match(/\$?(\d+(?:\.\d+)?)/);
      if (budgetMatch) updatedFields.budget = parseFloat(budgetMatch[1]);
    }

    // Materials update only if message includes "material"
    if (/material/i.test(message) && updatedText) {
      updatedFields.materials = [updatedText];
    }

    // Apply updates
    for (let key in updatedFields) {
      proposal[key] = updatedFields[key];
    }

    proposal.updatedAt = new Date();
    await proposal.save();

    res.json({ msg: "Proposal updated successfully", updatedFields, proposal });

  } catch (err) {
    console.error("editProposalAI error:", err.response?.data || err.message);
    res.status(500).json({ msg: "Error editing proposal with AI", error: err.response?.data || err.message });
  }
};

// ========================
// Evaluate proposals and update rank/status
// ========================
export const evaluateTenderProposals = async (tenderId) => {
  try {
    const tender = await Tender.findById(tenderId);
    if (!tender) return;

    if (new Date() < new Date(tender.deadline)) return;

    const proposals = await Proposal.find({ tenderId }).populate("userId");
    const results = [];

    for (let proposal of proposals) {
      const profile = await Profile.findOne({ user: proposal.userId._id });
      if (!profile) continue;

      const rankScore = calculateRank(profile, proposal, tender);
      results.push({ proposal, rankScore });
    }

    results.sort((a, b) => b.rankScore - a.rankScore);

    for (let i = 0; i < results.length; i++) {
      const status = i < 1 ? "accepted" : "rejected";
      await Proposal.findByIdAndUpdate(results[i].proposal._id, {
        rank: i + 1,
        status,
      });
    }

    console.log("Proposals evaluated for tender:", tenderId);
  } catch (err) {
    console.error("evaluateTenderProposals error:", err);
  }
};

// ========================
// Node-cron: evaluate all tenders every minute
// ========================
cron.schedule("* * * * *", async () => {
  console.log("Running scheduled tender evaluation...");
  try {
    const tenders = await Tender.find({});
    for (const tender of tenders) {
      await evaluateTenderProposals(tender._id);
    }
    console.log("Scheduled evaluation completed.");
  } catch (err) {
    console.error("Scheduled evaluation error:", err);
  }
});
