const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const {
    addSleep,
    getSleep,
    updateSleep,
    deleteSleep
} = require("../Controller/sleepController");

const auth = require("../Middleware/authMiddleware");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Add
router.post(
    "/",
    auth,
    [
        body("sleepTime").isISO8601().withMessage("Invalid sleep time"),
        body("wakeTime").isISO8601().withMessage("Invalid wake time"),
        body("quality").optional().isIn(["good", "average", "poor", "extreme"]).withMessage("Invalid quality")
    ],
    handleValidationErrors,
    addSleep
);

// Get
router.get("/", auth, getSleep);

// Update
router.put(
    "/:id",
    auth,
    [
        body("sleepTime").optional().isISO8601().withMessage("Invalid sleep time"),
        body("wakeTime").optional().isISO8601().withMessage("Invalid wake time"),
        body("quality").optional().isIn(["good", "average", "poor", "extreme"]).withMessage("Invalid quality")
    ],
    handleValidationErrors,
    updateSleep
);

// Delete
router.delete("/:id", auth, deleteSleep);

module.exports = router;