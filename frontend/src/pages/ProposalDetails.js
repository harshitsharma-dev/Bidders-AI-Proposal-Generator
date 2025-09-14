import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api.js";

export default function ProposalDetails() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch single proposal by ID
    API.get(`/proposals/${id}`)
      .then(res => setProposal(res.data))
      .catch(err => console.error("Error fetching proposal:", err));
  }, [id]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: chatInput };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call backend AI edit route
      console.log("Sending to Edit AI");
      const res = await API.put(`/proposals/${id}/edit-ai`, { message: chatInput });
      console.log("Edit Response..",res.data);

      // AI response
      const aiMessage = { role: "assistant", content: res.data.proposal.materials };
      setMessages(prev => [...prev, aiMessage]);

      // Update displayed proposal with AI-edited materials
      setProposal(res.data.proposal);
      setChatInput("");
    } catch (err) {
      console.error("Error editing proposal with AI:", err);
    }
  };

  if (!proposal) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Proposal for {proposal.tenderId?.title}</h2>
      <p><strong>Budget:</strong> {proposal.budget}</p>
      <p><strong>Timeline:</strong> {proposal.timeline} days</p>
      <p><strong>Materials:</strong> {proposal.materials.join(", ")}</p>
      <p><strong>Status:</strong> {proposal.status}</p>

      <button
        onClick={() => setShowChat(true)}
        style={{
          padding: "10px",
          marginTop: "20px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px"
        }}
      >
        Edit Proposal
      </button>

      {showChat && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ddd",
            padding: "10px",
            borderRadius: "8px"
          }}
        >
          <h3>Chat with AI to Edit Proposal</h3>
          <div
            style={{
              height: "200px",
              overflowY: "auto",
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px"
            }}
          >
            {messages.map((m, i) => (
              <p key={i} style={{ color: m.role === "user" ? "blue" : "green" }}>
                <strong>{m.role}:</strong> {m.content}
              </p>
            ))}
          </div>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type changes you want..."
            style={{ width: "80%", padding: "8px" }}
          />
          <button
            onClick={handleSendMessage}
            style={{ padding: "8px 16px", marginLeft: "10px" }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
