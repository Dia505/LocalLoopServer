const EventExplorer = require("../model/event_explorer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const nodemailer = require("nodemailer");

const findAll = async (req, res) => {
    try {
        const eventExplorer = await EventExplorer.find();
        res.status(200).json(eventExplorer);
    }
    catch (e) {
        res.json(e)
    }
}

const save = async (req, res) => {
    try {
        const { fullName, mobileNumber, address, city, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const eventExplorer = new EventExplorer({
            fullName,
            mobileNumber,
            address,
            city,
            email,
            password: hashedPassword,
            profilePicture: req.file?.originalname || "default_profile_img.png"
        });

        await eventExplorer.save();
        const savedUser = await EventExplorer.findById(eventExplorer._id);

        const token = jwt.sign(
            { role: eventExplorer.role, userId: eventExplorer._id },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        const { password: pw, ...eventExplorerData } = eventExplorer.toObject();

        res.status(201).json({
            message: "Event explorer created successfully",
            eventExplorer: eventExplorerData,
            token,
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "An error occurred while creating the event explorer" });
    }
};

const findById = async (req, res) => {
    try {
        const eventExplorer = await EventExplorer.findById(req.user.id);

        if (!eventExplorer) {
            return res.status(404).json({ message: "Event explorer not found" });
        }

        const BASE_URL = "http://localhost:3000";

        const profilePicture = eventExplorer.profilePicture
            ? `${BASE_URL}/event-explorer-images/${eventExplorer.profilePicture}`
            : `${BASE_URL}/event-explorer-images/default_profile_img.png`;

        res.status(200).json({ ...eventExplorer._doc, profilePicture: profilePicture });
    } catch (e) {
        res.status(500).json({ message: "Server error", error: e });
    }
};

const deleteById = async (req, res) => {
    try {
        const deletedExplorer = await EventExplorer.findByIdAndDelete(req.params.id);

        if (!deletedExplorer) {
            return res.status(404).json({ message: "Event explorer not found" });
        }

        res.status(200).json({ message: "Event explorer deleted successfully" });
    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ message: "An error occurred while deleting the event explorer", error: e.message });
    }
};

const update = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If the request contains a password, hash it before updating
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        } else {
            // Prevent MongoDB from setting password to undefined
            delete updateData.password;
        }

        const eventExplorer = await EventExplorer.findByIdAndUpdate(req.params.id, updateData, { new: true });

        res.status(200).json(eventExplorer);
    } catch (e) {
        res.status(500).json(e);
    }
};

const updateProfilePicture = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const eventExplorer = await EventExplorer.findById(req.params.id);
        if (!eventExplorer) {
            return res.status(404).json({ message: "Event explorer not found" });
        }

        // Update only the profile picture, keeping the existing password
        eventExplorer.profilePicture = req.file.filename;
        await eventExplorer.save();

        res.status(200).json(eventExplorer);
    } catch (e) {
        res.status(500).json(e);
    }
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const eventExplorer = await EventExplorer.findOne({ email });

        if (!eventExplorer) return res.status(404).json({ message: "Event explorer not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        eventExplorer.otp = otp;
        eventExplorer.otpExpiresAt = otpExpiresAt;
        await eventExplorer.save();

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            protocol: "smtp",
            auth: {
                user: "localloop2025@gmail.com",
                pass: "ejjpleiswwikbvmz"
            }
        })

        await transporter.sendMail({
           from: '"LocalLoop Support" <localloop2025@gmail.com>',
            to: eventExplorer.email,
            subject: "Reset Your Password",
            html: `
                <h1>Reset your password</h1>
                <p>Use the following OTP to reset your password:</p>
                <h2>${otp}</h2>
                <p>If you did not request this, please ignore this email.</p>
            `
        });

        res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const eventExplorer = await EventExplorer.findOne({ email });

        if (!eventExplorer) {
            return res.status(404).json({ message: "Event explorer not found" });
        }

        if (eventExplorer.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (eventExplorer.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, otp } = req.body;

        const eventExplorer = await EventExplorer.findOne({ email });

        if (!eventExplorer) {
            return res.status(404).json({ message: "Event explorer not found" });
        }

        if (eventExplorer.otp !== otp || eventExplorer.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await EventExplorer.findOneAndUpdate(
            { email },
            { password: hashedPassword, otp: null, otpExpiresAt: null },
            { new: true }
        );

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    findAll,
    save,
    findById,
    deleteById,
    update,
    updateProfilePicture,
    sendOtp,
    verifyOtp,
    resetPassword
}