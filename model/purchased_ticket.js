const mongoose = require("mongoose");

const purchasedTicketSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        required: true
    },
    eventExplorerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventExplorer",
        required: true
    },
})

const PurchasedTicket = mongoose.model("PurchasedTicket", purchasedTicketSchema);

module.exports = PurchasedTicket;
