// src/pages/MyProposals.js
import React, { useEffect, useState } from "react";
import API from "../api.js";

export default function MyProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/proposals/my")
      .then(res => setProposals(res.data))
      .catch(err => setProposals([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your proposals...</p>;

  if (proposals.length === 0) return <p>You have not submitted any proposals yet.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Proposals</h2>
      {proposals.map((p) => (
        <div
          key={p._id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          {p.tenderId ? (
            <>
              <p><strong>Tender:</strong> {p.tenderId.title}</p>
              <p><strong>Budget:</strong> {p.budget}</p>
              <p><strong>Timeline:</strong> {p.timeline} days</p>
              <p><strong>Status:</strong> {p.status}</p>
            </>
          ) : (
            <p><strong>Tender:</strong> Deleted</p>
          )}
        </div>
      ))}
    </div>
  );
}
