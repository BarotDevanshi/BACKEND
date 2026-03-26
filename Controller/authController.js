const User = require("../Model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔹 Register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // check user
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🔹 Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        // 🔥 TOKEN GENERATE
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};