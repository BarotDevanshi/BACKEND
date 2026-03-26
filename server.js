const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Load environment variables
dotenv.config();

// App init
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // body parser

// Test route
app.get("/", (req, res) => {
res.send("API is running 🚀");
});

// MongoDB connection with better error handling
console.log("MongoDB URI:", process.env.MONGO_URI || "NOT SET");

mongoose
.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    // Continue running without DB for testing
});

//-------->API ROUTES<--------//
// Sample API route
app.get("/api/test", (req, res) => {
res.json({ message: "Test API working 💯" });
});

//auth api
const authRoutes = require("./Routes/authRoutes");
app.use("/api/auth", authRoutes);

//mood API
const moodRoutes = require("./Routes/moodRoutes");
app.use("/api/moods", moodRoutes);

//Task api
const taskRoutes = require("./Routes/taskRoutes");
app.use("/api/tasks", taskRoutes);

//Sleep api
const sleepRoutes = require("./Routes/sleepRoutes");
app.use("/api/sleep", sleepRoutes);

//activity api
const activityRoutes = require("./Routes/activityRoutes");
app.use("/api/activity", activityRoutes);

//progress api
const progressRoutes = require("./Routes/progressRoutes");
app.use("/api/progress", progressRoutes);


// Port setup
const PORT = process.env.PORT || 5000;

// Server start
app.listen(PORT, () => {
console.log(`Server running on port ${PORT} 🔥`);
});

