import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api.js";

export default function ProposalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ budget: "", timeline: "", materials: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.budget || !form.timeline || !form.materials) {
      alert("Please fill all fields");
      return;
    } 

    try {
      console.log(id);
      const { data } = await API.post("/proposals", {
        tenderId: id,
        budget: Number(form.budget),
        timeline: Number(form.timeline),
        materials: form.materials.split(",").map((m) => m.trim()),
      });
      alert(`Proposal submitted successfully! Your Rank: ${data.rank}`);
      navigate("/dashboard"); // redirect back to dashboard
    } catch (err) {
      alert(err.response?.data?.msg || "Error submitting proposal");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Submit Proposal for Tender: {id}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="number"
          placeholder="Budget (in INR)"
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        />
        <input
          type="number"
          placeholder="Timeline (in days)"
          value={form.timeline}
          onChange={(e) => setForm({ ...form, timeline: e.target.value })}
        />
        <input
          type="text"
          placeholder="Materials (comma-separated)"
          value={form.materials}
          onChange={(e) => setForm({ ...form, materials: e.target.value })}
        />
        <button type="submit" style={{ padding: "10px", background: "#007bff", color: "#fff", border: "none" }}>
          Submit Proposal
        </button>
      </form>
    </div>
  );
}
