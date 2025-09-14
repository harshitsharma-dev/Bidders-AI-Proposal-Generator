import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api.js";

export default function Dashboard() {
  const [tenders, setTenders] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Fetch tenders
    API.get("/tenders").then(res => setTenders(res.data));

    // ✅ Fetch my proposals
    API.get("/proposals/my")
      .then(res => setProposals(res.data))
      .catch(err => console.error(err));

    // ✅ Fetch profile
    API.get("/profile/me")
      .then(res => {
        setProfile(res.data);
        if (!res.data || !res.data.companyName) {
          setShowPopup(true);
        }
      })
      .catch(() => setShowPopup(true));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      {/* 🔹 Top bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/profile")}
          style={{
            padding: "8px 16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          My Profile
        </button>
      </div>

      {/* 🔹 Available Tenders */}
      <h2>Available Tenders</h2>
      <ul>
        {tenders.map(tender => (
          <li key={tender._id}>
            <Link to={`/tenders/${tender._id}`}>{tender.title}</Link>
          </li>
        ))}
      </ul>

      {/* 🔹 My Proposals */}
      <h2 style={{ marginTop: "30px" }}>My Proposals</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {proposals.map(p => (
          <div
            key={p._id}
            onClick={() => navigate(`/proposals/${p._id}`)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              cursor: "pointer",
              flex: "0 0 250px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}
          >
            <h4>{p.tenderId?.title || "Untitled Tender"}</h4>
            <p><strong>Status:</strong> {p.status}</p>
            <p><strong>Budget:</strong> {p.budget}</p>
          </div>
        ))}
      </div>

      {/* 🔹 Popup for incomplete profile */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              maxWidth: "400px"
            }}
          >
            <h3>Complete Your Profile</h3>
            <p>You need to complete your profile before applying for tenders.</p>
            <button
              onClick={() => navigate("/profile")}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Go to Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
