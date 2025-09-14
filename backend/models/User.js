import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // ✅ Add this
  skills: [String],
  experience: String,
  certifications: [String],
  profileStrength: Number,
  role: { type: String, default: "bidder" }, // optional: for admin/bidder distinction
});

export default mongoose.model("User", userSchema);
