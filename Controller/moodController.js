const Mood = require("../Model/Mood");
const { sendSmartNotification } = require("./notificationController");

// ➤ Add Mood (with 30-minute rate limiting)
exports.addMood = async (req, res) => {
    try {
        console.log("[MOOD API] Received request with:", { body: req.body, userId: req.user?.id });

        if (!req.user || !req.user.id) {
            console.error("[MOOD API] ERROR: No user ID found in request");
            return res.status(401).json({ error: "User authentication failed" });
        }

        // Check if user already added a mood in the last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
        const recentMood = await Mood.findOne({
            userId: req.user.id,
            createdAt: { $gte: thirtyMinutesAgo }
        }).sort({ createdAt: -1 });

        if (recentMood) {
            const lastMoodTime = new Date(recentMood.createdAt);
            const nextAvailableTime = new Date(lastMoodTime.getTime() + 30 * 60 * 1000); // 30 minutes later
            const timeRemaining = Math.ceil((nextAvailableTime - new Date()) / 1000); // seconds remaining
            
            console.log(`[MOOD API] User ${req.user.id} attempted mood entry too soon. Last entry: ${lastMoodTime}, Next available: ${nextAvailableTime}`);
            return res.status(429).json({
                error: "You can only add mood once every 30 minutes. Please try again later.",
                nextAvailableTime: nextAvailableTime,
                timeRemaining: timeRemaining
            });
        }

        const mood = await Mood.create({
            userId: req.user.id,
            mood: req.body.mood,
            note: req.body.note
        });

        console.log(`[DB SUCCESS] Mood saved for userId: ${req.user.id}`, mood);

        // 🔔 Send push notification based on mood
        sendSmartNotification(req.user.id, "mood").catch(() => {});

        res.json({ success: true, data: mood, message: "Mood recorded! You can add another mood in 30 minutes." });

    } catch (err) {
        console.error(`[DB ERROR] Error saving mood:`, err);
        res.status(500).json({ error: err.message, details: err.toString() });
    }
};

// ➤ Get All Moods of User
exports.getMoods = async (req, res) => {
    try {
        const moods = await Mood.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: moods });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ➤ Delete Mood
exports.deleteMood = async (req, res) => {
    try {
        const mood = await Mood.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!mood) {
            return res.status(404).json({ message: "Mood not found or unauthorized" });
        }

        res.json({ success: true, message: "Mood deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};