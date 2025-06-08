const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    ticketType: {
        type: String,
        required: true
    },
    ticketPrice: {
        type: Number,
        required: true
    },
    ticketQuantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0,
        required: false
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    }
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;