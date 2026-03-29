const Sleep = require("../Model/Sleep");

// ➤ Add Sleep Data
exports.addSleep = async (req, res) => {
    try {
        const { sleepTime, wakeTime, quality } = req.body;

        // duration calculate
        const duration =
            (new Date(wakeTime) - new Date(sleepTime)) / (1000 * 60 * 60);

        const sleep = await Sleep.create({
            userId: req.user.id,
            sleepTime,
            wakeTime,
            duration,
            quality
        });

        console.log(`[DB SUCCESS] Sleep data saved for userId: ${req.user.id}`);
        res.json({ success: true, data: sleep });

    } catch (err) {
        console.error(`[DB ERROR] Error saving sleep data:`, err.message);
        res.status(500).json({ error: err.message });
    }
};


// ➤ Get Sleep History
exports.getSleep = async (req, res) => {
    try {
        const sleepData = await Sleep.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: sleepData });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ➤ Update Sleep
exports.updateSleep = async (req, res) => {
    try {
        const { sleepTime, wakeTime } = req.body;

        let duration;
        if (sleepTime && wakeTime) {
            duration =
                (new Date(wakeTime) - new Date(sleepTime)) /
                (1000 * 60 * 60);
        }

        const updated = await Sleep.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { ...req.body, duration },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Sleep record not found or unauthorized" });
        }

        res.json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ➤ Delete Sleep Entry
exports.deleteSleep = async (req, res) => {
    try {
        const sleep = await Sleep.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!sleep) {
            return res.status(404).json({ message: "Sleep record not found or unauthorized" });
        }

        res.json({ success: true, message: "Sleep record deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};