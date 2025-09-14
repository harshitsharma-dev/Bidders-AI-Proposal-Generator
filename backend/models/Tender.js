import mongoose from "mongoose";

const tenderSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  fullDescription: String,
  requirements: {
    minBudget: Number,
    maxTimeline: Number,
    requiredMaterials: [String],
    requiredSpecialization: [String]
  },
  deadline: Date
});

export default mongoose.model("Tender", tenderSchema);
