const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    totalTasks: {
        type: Number,
        default: 0
    },

    completedTasks: {
        type: Number,
        default: 0
    },

    pendingTasks: {
        type: Number,
        default: 0
    },

    completionRate: {
        type: Number,
        default: 0
    },

    streak: {
        type: Number,
        default: 0
    },

    lastCompletedDate: {
        type: Date
    },

    gamesPlayed: {
        type: Number,
        default: 0
    },

    badges: [{
        type: String
    }]

}, { timestamps: true });

module.exports = mongoose.model("Progress", progressSchema);