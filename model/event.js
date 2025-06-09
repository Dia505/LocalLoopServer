const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: false
    },
    eventPhoto: {
        type: String,
        required: true
    },
    eventVideo: {
        type: [String],
        required: false,
        default: []
    },
    isPaid: {
        type: Boolean,
        required: true
    },
    totalSeats: {
        type: Number,
        required: false
    },
    archivedDate: {
        type: Date,
        default: null,
    },
    eventOrganizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventOrganizer",
        required: true
    }
});

eventSchema.pre("save", function (next) {
    if (this.isModified("date") || !this.archivedDate) {
        const oneDayAfter = new Date(this.date);
        oneDayAfter.setDate(oneDayAfter.getDate() + 1);
        this.archivedDate = oneDayAfter;
    }
    next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;