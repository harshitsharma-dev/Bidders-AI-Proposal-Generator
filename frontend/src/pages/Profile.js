// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import API from "../api.js";

export default function Profile() {
  const [formData, setFormData] = useState({
    companyName: "",
    experienceYears: "",
    specialization: "",
    certifications: "",
  });
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch profile when page loads
  useEffect(() => {
    API.get("/profile/me")
      .then(res => {
        if (res.data) {
          setFormData({
            companyName: res.data.companyName || "",
            experienceYears: res.data.experienceYears || "",
            specialization: (res.data.specialization || []).join(", "),
            certifications: (res.data.certifications || []).join(", "),
          });
          setIsEditing(false);
        }
      })
      .catch(() => {
        // no profile found → allow editing
        setIsEditing(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        companyName: formData.companyName,
        experienceYears: Number(formData.experienceYears),
        specialization: formData.specialization
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        certifications: formData.certifications
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c),
      };

      await API.post("/profile", payload);
      alert("Profile saved successfully!");
      setIsEditing(false);
    } catch (err) {
      alert("Error saving profile");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>My Profile</h2>

      {isEditing ? (
        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          <div>
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Experience (Years)</label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Specialization (comma separated)</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Certifications (comma separated)</label>
            <input
              type="text"
              name="certifications"
              value={formData.certifications}
              onChange={handleChange}
            />
          </div>

          <button type="submit" style={{ marginTop: "15px" }}>
            Save Profile
          </button>
        </form>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Company Name:</strong> {formData.companyName}
          </p>
          <p>
            <strong>Experience Years:</strong> {formData.experienceYears}
          </p>
          <p>
            <strong>Specialization:</strong> {formData.specialization}
          </p>
          <p>
            <strong>Certifications:</strong> {formData.certifications}
          </p>

          <button
            onClick={() => setIsEditing(true)}
            style={{ marginTop: "15px" }}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
}
