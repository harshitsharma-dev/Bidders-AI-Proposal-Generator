import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api.js";

export default function TenderDetails() {
  const { id } = useParams();
  const [tender, setTender] = useState(null);

  console.log(id);

  useEffect(() => {
    API.get(`/tenders/${id}`).then(res => setTender(res.data));
  }, [id]);

  if (!tender) return <p>Loading...</p>;

  const deadlinePassed = new Date() > new Date(tender.deadline);

  return (
    <div>
      <h2>{tender.title}</h2>
      <p>{tender.fullDescription}</p>
      <p><b>Deadline:</b> {new Date(tender.deadline).toLocaleString()}</p>
      {deadlinePassed ? (
        <p style={{ color: "red" }}>Deadline has passed. You cannot apply.</p>
      ) : (
        <Link to={`/tenders/${tender._id}/propose`}>Submit Proposal</Link>
      )}
    </div>
  );
}
