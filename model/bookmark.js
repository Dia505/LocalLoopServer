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
    notifiedFiveDaysBefore: { 
        type: Boolean, 
        default: false 
    },
    notifiedFiveDaysRead: { 
        type: Boolean, 
        default: false 
    },
    notifiedOneDayBefore: { 
        type: Boolean, 
        default: false 
    },
    notifiedOneDayRead: { 
        type: Boolean, 
        default: false 
    },
})

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

module.exports = Bookmark;