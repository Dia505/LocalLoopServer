const Event = require("../model/event");

const findAll = async (req, res) => {
    try {
        const event = await Event.find().populate("eventOrganizerId");
        res.status(200).json(event);
    }
    catch (e) {
        res.json(e)
    }
}

const save = async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event)
    }
    catch (e) {
        res.json(e)
    }
}

const findById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate("eventOrganizerId");
        res.status(200).json(event);
    }
    catch (e) {
        res.json(e)
    }
}

const findByEventOrganizerId = async (req, res) => {
    try {
        const {eventOrganizerId} = req.params;
        const event = await Event.find({eventOrganizerId}).populate("eventOrganizerId");
        res.status(200).json(event);
    }
    catch (e) {
        res.json(e)
    }
}

const deleteById = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        
        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ message: "An error occurred while deleting the event", error: e.message });
    }
};

const update = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.status(201).json(event);
    }
    catch (e) {
        res.json(e)
    }
}

const updateEventPhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        event.eventPhoto = req.file.filename;
        await event.save();

        res.status(200).json(event);
    } catch (e) {
        res.status(500).json(e);
    }
}; 

const updateEventVideo = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Existing videos client wants to keep (send as JSON string in form data)
        // e.g., req.body.existingVideos = '["video1.mp4", "video2.mp4"]'
        let existingVideos = [];
        if (req.body.existingVideos) {
            existingVideos = JSON.parse(req.body.existingVideos);
        }

        // New uploaded videos filenames
        const newVideos = req.files ? req.files.map(file => file.filename) : [];

        // Combine existing kept videos with new uploaded videos
        event.eventVideo = [...existingVideos, ...newVideos];

        await event.save();

        res.status(200).json({
            message: "Event videos updated successfully",
            event,
        });
    } catch (e) {
        console.error("Error updating event videos:", e);
        res.status(500).json({ message: "Server error", error: e.message });
    }
};

module.exports = {
    findAll,
    save,
    findById,
    findByEventOrganizerId,
    deleteById,
    update,
    updateEventPhoto,
    updateEventVideo
}