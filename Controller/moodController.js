const Mood = require("../Model/Mood");

// ➤ Add Mood
exports.addMood = async (req, res) => {
    try {
        const mood = await Mood.create({
            userId: req.user.id,
            mood: req.body.mood,
            note: req.body.note
        });

        console.log(`[DB SUCCESS] Mood saved for userId: ${req.user.id}`);
        res.json({ success: true, data: mood });

    } catch (err) {
        console.error(`[DB ERROR] Error saving mood:`, err.message);
        res.status(500).json({ error: err.message });
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