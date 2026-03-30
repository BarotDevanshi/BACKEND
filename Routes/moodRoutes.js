const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const {
    addMood,
    getMoods,
    deleteMood
} = require("../Controller/moodController");

const auth = require("../Middleware/authMiddleware");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("[MOOD ROUTES] Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Add mood
router.post(
    "/",
    auth,
    [
        body("mood").isIn(["happy", "sad", "stressed", "neutral", "angry"]).withMessage("Invalid mood value")
    ],
    handleValidationErrors,
    addMood
);

// Get moods
router.get("/", auth, getMoods);

// Delete mood
router.delete("/:id", auth, deleteMood);

module.exports = router;