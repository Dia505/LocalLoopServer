const EventOrganizer = require("../model/event_organizer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const findAll = async (req, res) => {
    try {
        const eventOrganizer = await EventOrganizer.find();
        res.status(200).json(eventOrganizer);
    }
    catch (e) {
        res.json(e)
    }
}

const save = async (req, res) => {
    try {
        const { fullName, mobileNumber, email, password, companyName, businessType, panNumber, address, city, contactNumber, companyEmail, socialMediaLinks } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const eventOrganizer = new EventOrganizer({
            fullName,
            mobileNumber,
            email,
            password: hashedPassword,
            companyName,
            businessType,
            panNumber,
            address,
            city,
            contactNumber,
            companyEmail,
            socialMediaLinks,
            profilePicture: req.file?.originalname || "default_profile_img.png"
        });

        await eventOrganizer.save();

        const token = jwt.sign(
            { role: eventOrganizer.role, userId: eventOrganizer._id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        const { password: pw, ...eventOrganizerData } = eventOrganizer.toObject();

        res.status(201).json({
            message: "Event organizer created successfully",
            eventOrganizer: eventOrganizerData,
            token,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "An error occurred while creating the event organizer" });
    }
};

const findById = async (req, res) => {
    try {
        const eventOrganizer = await EventOrganizer.findById(req.params.id);

        if (!eventOrganizer) {
            return res.status(404).json({ message: "Event organizer not found" });
        }

        const BASE_URL = "http://localhost:3000";

        const profilePicture = eventOrganizer.profilePicture
            ? `${BASE_URL}/event_organizer_images/${eventOrganizer.profilePicture}`
            : `${BASE_URL}/event_organizer_images/default_profile_img.png`;

        res.status(200).json({ ...eventOrganizer._doc, profilePicture: profilePicture });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e });
    }
};

const deleteById = async (req, res) => {
    try {
        const deletedOrganizer = await EventOrganizer.findByIdAndDelete(req.params.id);

        if (!deletedOrganizer) {
            return res.status(404).json({ message: "Event organizer not found" });
        }

        res.status(200).json({ message: "Event organizer deleted successfully" });
    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ message: "An error occurred while deleting the event organizer", error: e.message });
    }
};

const update = async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            delete updateData.password;
        }

        const eventOrganizer = await EventOrganizer.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json(eventOrganizer);
    } catch (e) {
        res.status(500).json(e);
    }
};

const updateProfilePicture = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const eventOrganizer = await EventOrganizer.findById(req.params.id);
        if (!eventOrganizer) {
            return res.status(404).json({ message: "Event organizer not found" });
        }

        eventOrganizer.profilePicture = req.file.filename;
        await eventOrganizer.save();

        res.status(200).json(eventOrganizer);
    } catch (e) {
        res.status(500).json(e);
    }
};

module.exports = {
    findAll,
    save,
    findById,
    deleteById,
    update,
    updateProfilePicture
}