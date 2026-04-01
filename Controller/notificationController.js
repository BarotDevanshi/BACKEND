const webpush = require("web-push");
const Subscription = require("../Model/Subscription");
const Mood = require("../Model/Mood");
const Sleep = require("../Model/Sleep");
const Task = require("../Model/Task");

// Helper to send push notification to a subscription document
async function sendPush(sub, title, body, icon = "/logo192.png", data = {}) {
    const payload = JSON.stringify({ title, body, icon, data });
    const pushSub = {
        endpoint: sub.endpoint,
        keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
        },
    };
    try {
        await webpush.sendNotification(pushSub, payload);
    } catch (err) {
        // If subscription expired / gone, remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
            await Subscription.deleteOne({ _id: sub._id });
        } else {
            throw err;
        }
    }
}

// ✅ SAVE / UPDATE subscription (user-based)
exports.subscribeUser = async (req, res) => {
    try {
        const { subscription, userId } = req.body;

        if (!subscription || !userId) {
            return res.status(400).json({ error: "Missing subscription or userId" });
        }

        await Subscription.findOneAndUpdate(
            { userId },
            {
                userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
            { upsert: true, new: true }
        );

        res.json({ message: "Subscribed successfully ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ SEND SMART CONTEXTUAL NOTIFICATION to a single user
// Called by: cron jobs, mood updates, task changes, sleep logs
exports.sendSmartNotification = async (userId, context = "general") => {
    try {
        const sub = await Subscription.findOne({ userId });
        if (!sub) return; // user hasn't subscribed

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [latestMood, latestSleep, tasks] = await Promise.all([
            Mood.findOne({ userId, createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 }),
            Sleep.findOne({ userId, createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 }),
            Task.find({ userId, status: "pending" }),
        ]);

        let title = "Neuro Nexus 🧠";
        let body = "";

        if (context === "mood") {
            // Triggered after mood is logged
            if (latestMood?.mood === "sad") {
                title = "Feeling low? 💙";
                body = "Take a short break, listen to calming music 🎧. You've got this!";
            } else if (latestMood?.mood === "stressed") {
                title = "Stress detected 😰";
                body = "Try 5 deep breaths or a 10-min walk. Small steps matter!";
            } else if (latestMood?.mood === "happy") {
                title = "You're in the zone! 🚀";
                body = "Great energy! Tackle your high-priority tasks now 💪";
            } else if (latestMood?.mood === "angry") {
                title = "Take it easy 😤";
                body = "Step away for a bit. A clear mind works better 🌿";
            } else {
                title = "Mood Logged ✅";
                body = "Thanks for checking in! Keep going 🌟";
            }
        } else if (context === "sleep") {
            // Triggered after sleep is logged
            const sleepHours = latestSleep?.duration || 0;
            if (sleepHours < 5) {
                title = "Low Sleep Alert 😴";
                body = "You slept under 5 hours! Take it easy today and try to rest more.";
            } else if (sleepHours < 7) {
                title = "Sleep could be better 🌙";
                body = "You slept a bit short. Aim for 7-8 hours for peak performance!";
            } else {
                title = "Sleep Logged ✅";
                body = `Great! You got ${sleepHours.toFixed(1)} hours. Ready to crush the day! ⚡`;
            }
        } else if (context === "task_completed") {
            // Triggered when a task is completed
            const completedCount = tasks.filter(t => t.status === "completed").length;
            title = "Task Done! ✅";
            body = `Amazing work! Keep the momentum going 🔥`;
        } else if (context === "task_added") {
            // Triggered when a new task is added
            title = "Task Added 📝";
            body = `New task in your dumpyard! Let's get it done 💡`;
        } else if (context === "daily_reminder") {
            // Morning reminder cron job
            const pendingCount = tasks.length;
            if (pendingCount === 0) {
                title = "Good Morning! ☀️";
                body = "You're all clear! Add tasks to stay productive today.";
            } else {
                title = `You have ${pendingCount} pending task${pendingCount > 1 ? 's' : ''} 📋`;
                body = "Open Neuro Nexus to plan your day and check your AI schedule!";
            }
        } else if (context === "schedule_ready") {
            // Triggered after AI schedule is generated
            title = "Your Daily Schedule is Ready! 🗓️";
            body = "AI has planned your day. Open the app to see your personalized timeline ✨";
        } else {
            // Fallback general notification
            title = "Hey there! 👋";
            body = "Don't forget to log your mood, sleep & tasks today 😊";
        }

        await sendPush(sub, title, body);
        console.log(`[PUSH] ✅ Notification sent to userId: ${userId} | context: ${context}`);
    } catch (err) {
        console.error(`[PUSH ERROR] userId: ${userId} | ${err.message}`);
    }
};

// ✅ HTTP route: trigger notification for current user (called from frontend)
exports.sendNotificationToUser = async (req, res) => {
    try {
        const { userId, context } = req.body;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        await exports.sendSmartNotification(userId, context || "general");
        res.json({ message: "Notification sent ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ CRON: Send daily morning reminders to ALL subscribed users
exports.sendDailyReminders = async () => {
    try {
        const subs = await Subscription.find();
        console.log(`[CRON] 🔔 Sending morning reminders to ${subs.length} users`);
        for (const sub of subs) {
            await exports.sendSmartNotification(sub.userId, "daily_reminder");
        }
    } catch (err) {
        console.error("[CRON ERROR] Daily reminders:", err.message);
    }
};

// ✅ HTTP route: send to all (admin utility)
exports.sendNotificationToAll = async (req, res) => {
    try {
        await exports.sendDailyReminders();
        res.json({ message: "Notifications sent to all users ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};