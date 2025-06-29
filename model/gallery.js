const { required } = require("joi");
const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema({
    eventTitle: {
        type: String,
        required: true
    },
    coverPhoto: {
        type: String,
        required: true
    },
    galleryPhotos: {
        type: [String],
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyProfilePicture: {
        type: String,
        required: false,
        default: "default_profile_img.png"
    },
    companySocialMediaLinks: {
        type: [String],
        default: []
    },
});

const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;