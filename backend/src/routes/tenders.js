// routes/tenders.js
const express = require("express");
const TenderController = require("../controllers/tenderController");
const auth = require("../middleware/auth");

const router = express.Router();

// Public routes (with auth)
router.get("/search", auth, TenderController.searchTenders);
router.get("/recommendations", auth, TenderController.getRecommendations);
router.get("/stats", auth, TenderController.getTenderStats);
router.get("/:id", auth, TenderController.getTenderById);

// Government API routes
router.get("/country/:country", auth, TenderController.getTendersByCountry);
router.get("/location/:location", auth, TenderController.getTendersByLocation);
router.get("/api/countries", auth, TenderController.getCountries);

// Admin routes (you might want to add admin middleware)
router.post("/", auth, TenderController.createTender);
router.put("/:id", auth, TenderController.updateTender);
router.delete("/:id", auth, TenderController.deleteTender);
router.post("/scrape", auth, TenderController.triggerScraping);

module.exports = router;
