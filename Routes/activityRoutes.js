const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const {
    chat,
    getRecommendation,
    getChatHistory,
    getRecommendations,
    getLogs
} = require("../Controller/activityController");

const auth = require("../Middleware/authMiddleware");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Chat
router.post(
    "/chat",
    auth,
    [
        body("message").trim().notEmpty().withMessage("Message is required")
    ],
    handleValidationErrors,
    chat
);

// AI Suggestion
router.post("/recommend", auth, getRecommendation);

// History
router.get("/chat", auth, getChatHistory);
router.get("/recommend", auth, getRecommendations);

// Logs
router.get("/logs", auth, getLogs);

module.exports = router;