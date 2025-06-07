const mongoose = require("mongoose");

const eventOrganizerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    mobileNumber: {
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
    companyName: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true
    },
    panNumber: {
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
    contactNumber: {
        type: String,
        required: true
    },
    companyEmail: {
        type: String,
        required: true
    },
    socialMediaLinks: {
        type: [String],
        default: []
    },
    profilePicture: {
        type: String,
        required: false,
        default: "default_profile_img.png"
    },
    role: {
        type: String,
        default: "event organizer"
    }
})

const EventOrganizer = mongoose.model("EventOrganizer", eventOrganizerSchema)

module.exports = EventOrganizer;