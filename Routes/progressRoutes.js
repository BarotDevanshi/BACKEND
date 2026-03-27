const express = require("express");
const router = express.Router();

const { getProgress, logAppOpen } = require("../Controller/progressController");
const auth = require("../Middleware/authMiddleware");

// Get progress
router.get("/", auth, getProgress);


// Daily app-open streak
router.post("/app-open", auth, logAppOpen);

module.exports = router;