const express = require("express");
const { getItinerary } = require("../controllers/itineraryController");
const router = express.Router();

// Route to handle itinerary form submission
router.post("/generate", getItinerary);

module.exports = router;
