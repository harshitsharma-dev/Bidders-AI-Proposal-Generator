// tenderController.js
import Tender from "../models/Tender.js";

// Fetch all tenders from DB
export const fetchTenders = async (req, res) => {
  console.log("Trying to fetch tenders..");
  try {
    const tenders = await Tender.find();
    res.json(tenders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Fetch single tender by Mongo _id
export const getTenderById = async (req, res) => {
  try {
    const tender = await Tender.findById(req.params.id);
    if (!tender) return res.status(404).json({ msg: "Tender not found" });
    res.json(tender);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
