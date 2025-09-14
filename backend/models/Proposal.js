import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tenderId: { type: mongoose.Schema.Types.ObjectId, ref: "Tender", required: true },
  budget: Number,
  timeline: Number,
  materials: [String],
  rank: Number,
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

export default mongoose.model("Proposal", ProposalSchema);
