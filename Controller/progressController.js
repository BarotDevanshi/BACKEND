const Progress = require("../Model/Progress");
const Task = require("../Model/Task");


// 🔄 UPDATE PROGRESS (internal use)
exports.updateProgress = async (userId) => {
    const total = await Task.countDocuments({ userId });
    const completed = await Task.countDocuments({
        userId,
        status: "completed"
    });

    const pending = total - completed;

    const completionRate = total > 0
        ? (completed / total) * 100
        : 0;

    let progress = await Progress.findOne({ userId });

    if (!progress) {
        progress = new Progress({ userId });
    }

    // 🔥 STREAK LOGIC
    const today = new Date().toDateString();

    if (progress.lastCompletedDate) {
        const last = new Date(progress.lastCompletedDate).toDateString();

        if (last === today) {
            // same day → no change
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (new Date(progress.lastCompletedDate).toDateString() === yesterday.toDateString()) {
                progress.streak += 1;
            } else {
                progress.streak = 1;
            }
        }
    } else {
        progress.streak = 1;
    }

    progress.lastCompletedDate = new Date();

    progress.totalTasks = total;
    progress.completedTasks = completed;
    progress.pendingTasks = pending;
    progress.completionRate = completionRate;

    await progress.save();
};



// 📥 GET PROGRESS
exports.getProgress = async (req, res) => {
    try {
        let progress = await Progress.findOne({
            userId: req.user.id
        });

        // agar nahi hai to create
        if (!progress) {
            progress = await Progress.create({
                userId: req.user.id
            });
        }

        res.json({ success: true, data: progress });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// 📅 LOG APP OPEN: +1 streak only on first open of each day (skipping days keeps streak)
exports.logAppOpen = async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = await Progress.create({ userId: req.user.id });
        }

        const todayStr = new Date().toDateString();
        const lastOpenStr = progress.lastOpenedDate ? new Date(progress.lastOpenedDate).toDateString() : null;

        let streakIncreased = false;

        if (lastOpenStr !== todayStr) {
            // First open today → increment streak
            progress.streak = (progress.streak || 0) + 1;
            progress.lastOpenedDate = new Date();
            streakIncreased = true;
            await progress.save();
        }

        res.json({ success: true, streak: progress.streak, streakIncreased });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};