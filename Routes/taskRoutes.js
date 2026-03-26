const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const {
    createTask,
    getTasks,
    updateTask,
    deleteTask
} = require("../Controller/taskController");

const auth = require("../Middleware/authMiddleware");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Create
router.post(
    "/",
    auth,
    [
        body("title").trim().notEmpty().withMessage("Title is required"),
        body("priority").optional().isIn(["high", "medium", "low"]).withMessage("Invalid priority")
    ],
    handleValidationErrors,
    createTask
);

// Read
router.get("/", auth, getTasks);

// Update
router.put(
    "/:id",
    auth,
    [
        body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
        body("priority").optional().isIn(["high", "medium", "low"]).withMessage("Invalid priority"),
        body("status").optional().isIn(["pending", "completed"]).withMessage("Invalid status")
    ],
    handleValidationErrors,
    updateTask
);

// Delete
router.delete("/:id", auth, deleteTask);

module.exports = router;