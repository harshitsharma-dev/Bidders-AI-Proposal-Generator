// controllers/profileController.js
import Profile from "../models/Profile.js";

// 🔹 Create or Update Profile
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { companyName, experienceYears, specialization, certifications } = req.body;
    const userId = req.user.id;

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { companyName, experienceYears, specialization, certifications },
      { new: true, upsert: true }
    );

    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// 🔹 Get My Profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
