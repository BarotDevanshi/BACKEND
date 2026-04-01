const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    endpoint: String,
    keys: {
        p256dh: String,
        auth: String,
    },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);