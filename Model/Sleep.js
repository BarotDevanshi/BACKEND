const mongoose = require("mongoose");

const sleepSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    sleepTime: {
        type: Date,
        required: true
    },

    wakeTime: {
        type: Date,
        required: true
    },

    duration: {
        type: Number // hours me store karenge
    },

    quality: {
        type: String,
        enum: ["good", "average", "poor", "extreme"]
    }

}, { timestamps: true });

module.exports = mongoose.model("Sleep", sleepSchema);