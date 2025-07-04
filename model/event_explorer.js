const mongoose = require("mongoose");

const eventExplorerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobileNumber: {
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
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        required: false,
        default: "default_profile_img.png"
    },
    role: {
        type: String,
        default: "event explorer"
    },
    otp: { 
        type: String, 
        required: false 
    },
    otpExpiresAt: { 
        type: Date, 
        required: false 
    }
})

const EventExplorer = mongoose.model("EventExplorer", eventExplorerSchema)

module.exports = EventExplorer;