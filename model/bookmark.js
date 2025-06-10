const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema({
    eventExplorerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventExplorer",
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
})

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

module.exports = Bookmark;