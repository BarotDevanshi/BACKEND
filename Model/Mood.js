const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    mood: {
        type: String,
        enum: ["happy", "sad", "stressed", "neutral", "angry"],
        required: true
    },

    note: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.model("Mood", moodSchema);