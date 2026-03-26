const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: String,

    priority: {
        type: String,
        enum: ["high", "medium", "low"],
        default: "medium"
    },

    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },

    parentTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: null
    }

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);