// models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  companyName: String,
  experienceYears: Number,
  specialization: [String],
  certifications: [String]
});

export default mongoose.model("Profile", profileSchema);
