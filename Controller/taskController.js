const Task = require("../Model/Task");
const { updateProgress } = require("./progressController");

// ➤ Create Task / Subtask
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create({
            userId: req.user.id,
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
            parentTask: req.body.parentTask || null
        });

        res.json({ success: true, data: task });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ➤ Get All Tasks (with subtasks)
exports.getTasks = async (req, res) => {
    try {
        // 🔥 Auto-delete completed tasks older than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await Task.deleteMany({
            userId: req.user.id,
            status: "completed",
            updatedAt: { $lt: twentyFourHoursAgo }
        });

        const tasks = await Task.find({ userId: req.user.id });

        res.json({ success: true, data: tasks });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ➤ Update Task (status / title / priority)
exports.updateTask = async (req, res) => {
    try {
        const updated = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        // 🔥 IMPORTANT LINE
        if (req.body.status === "completed") {
            await updateProgress(req.user.id);
        }

        res.json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ➤ Delete Task (and its subtasks)
exports.deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        // delete main task (check ownership)
        const task = await Task.findOneAndDelete({
            _id: taskId,
            userId: req.user.id
        });

        if (!task) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        // delete subtasks
        await Task.deleteMany({ parentTask: taskId });

        res.json({ success: true, message: "Task deleted" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};