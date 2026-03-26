const express = require("express");
const router = express.Router();

const { getProgress, logGamePlayed } = require("../Controller/progressController");
const auth = require("../Middleware/authMiddleware");

// Get progress
router.get("/", auth, getProgress);

// Gamification: Log game played
router.post("/game-played", auth, logGamePlayed);

module.exports = router;