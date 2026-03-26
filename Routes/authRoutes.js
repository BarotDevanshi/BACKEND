const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const { register, login } = require("../Controller/authController");

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Register validation
router.post(
    "/register",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        body("name").trim().notEmpty().withMessage("Name is required")
    ],
    handleValidationErrors,
    register
);

// Login validation
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").notEmpty().withMessage("Password is required")
    ],
    handleValidationErrors,
    login
);

module.exports = router;