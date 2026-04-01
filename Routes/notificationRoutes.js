const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");

const {
    subscribeUser,
    sendNotificationToUser,
    sendNotificationToAll
} = require("../Controller/notificationController");

// Save push subscription for the logged-in user
router.post("/subscribe", auth, subscribeUser);

// Trigger a context-aware notification for a specific user
router.post("/notify-user", auth, sendNotificationToUser);

// Send morning reminder to all subscribed users (admin)
router.post("/notify-all", auth, sendNotificationToAll);

module.exports = router;