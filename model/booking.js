const { required } = require("joi");
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    seats: {
        type: Number,
        required: true
    },
    eventExplorerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventExplorer",
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;