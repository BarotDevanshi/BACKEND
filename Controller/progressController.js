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

// 🎮 GAMIFICATION: LOG GAME PLAYED
exports.logGamePlayed = async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = await Progress.create({ userId: req.user.id });
        }

        // Increment games played
        progress.gamesPlayed = (progress.gamesPlayed || 0) + 1;
        
        let rewardTip = "Great job engaging your brain! Keep it up. 🚀";
        let streakIncreased = false;
        let badgeEarned = null;

        // Give a major reward every 3 games
        if (progress.gamesPlayed % 3 === 0) {
            progress.streak += 1;
            streakIncreased = true;
            rewardTip = "Amazing consistency! Have a free +1 Day Streak! 🔥";

            // Give a random badge
            const potentialBadges = [
                "Zen Master 🧘", "Brain Athlete 🧠", 
                "Focus Champion 🎯", "Stress Buster 💥", 
                "Mindful Explorer 🌿", "Calm Spirit ☁️"
            ];
            const newBadge = potentialBadges[Math.floor(Math.random() * potentialBadges.length)];
            
            // Only add if they don't have it (optional, but let's allow multiples or just keep adding)
            if (!progress.badges.includes(newBadge)) {
                progress.badges.push(newBadge);
                badgeEarned = newBadge;
            } else {
                // If they already got that random badge, give a generic level-up badge
                badgeEarned = `Level ${progress.gamesPlayed / 3} Master 🌟`;
                progress.badges.push(badgeEarned);
            }
        }

        await progress.save();

        res.json({ 
            success: true, 
            gamesPlayed: progress.gamesPlayed,
            streakIncreased,
            badgeEarned,
            rewardTip,
            currentStreak: progress.streak
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};