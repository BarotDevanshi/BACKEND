const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const Task = require("./Model/Task");
const webpush = require("web-push");


// Scheduled job at 12:00 AM - delete completed tasks
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await Task.deleteMany({ status: "completed" });
    console.log(`[CRON] Deleted ${result.deletedCount} completed tasks at ${new Date().toISOString()}`);
  } catch (err) {
    console.log("[CRON ERROR]", err.message);
  }
});

// Scheduled job at 8:00 AM - send morning reminder notifications
cron.schedule("0 8 * * *", async () => {
  try {
    const { sendDailyReminders } = require("./Controller/notificationController");
    await sendDailyReminders();
    console.log(`[CRON] 🔔 Daily reminders sent at ${new Date().toISOString()}`);
  } catch (err) {
    console.log("[CRON ERROR] Morning reminders:", err.message);
  }
});

// Load environment variables
dotenv.config();

// ✅ Configure web-push VAPID keys
webpush.setVapidDetails(
  'mailto:[neuronexus813@gmail.com]',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// App init
const app = express();

// 🔹 Improved CORS for Mobile and Vercel
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // body parser

// 🔹 Health Check / Diagnostics Route
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  res.json({
    status: "OK",
    database: dbStatus,
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Test route
app.get("/", (req, res) => {
  res.send("NeuroNexus API is running 🚀");
});

// 🔹 Strict MongoDB connection
if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const dbName = mongoose.connection.name;
    const dbHost = mongoose.connection.host;
    console.log(`MongoDB Connected ✅ | Database: ${dbName} | Host: ${dbHost}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

//-------->API ROUTES<--------//
app.use("/api/auth", require("./Routes/authRoutes"));
app.use("/api/moods", require("./Routes/moodRoutes"));
app.use("/api/tasks", require("./Routes/taskRoutes"));
app.use("/api/sleep", require("./Routes/sleepRoutes"));
app.use("/api/activity", require("./Routes/activityRoutes"));
app.use("/api/progress", require("./Routes/progressRoutes"));
app.use("/api/ai", require("./Routes/aiRoutes"));
app.use("/api/notifications", require("./Routes/notificationRoutes"));

// Port setup
const PORT = process.env.PORT || 5000;

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🔥`);
});
