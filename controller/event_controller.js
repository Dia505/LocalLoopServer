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
        const eventData = {
            ...(req.body.value || req.body),
            eventPhoto: req.files["eventPhoto"] ? req.files["eventPhoto"][0].filename : undefined,
            eventVideo: req.files["eventVideo"] ? req.files["eventVideo"].map(file => file.filename) : [],
        };

        const event = new Event(eventData);
        await event.save();

        res.status(201).json(event);
    } catch (e) {
        console.error("Error creating event:", e);
        res.status(500).json({ message: "Error creating event", error: e.message });
    }
};

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
        const { eventOrganizerId } = req.params;
        const event = await Event.find({ eventOrganizerId }).populate("eventOrganizerId");
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
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

const searchEvents = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Missing search query" });

    const keywords = query.trim().toLowerCase().split(/\s+/);

    let isPaidFilter = null;

    // Check for keywords like "free" or "paid"
    if (keywords.includes("free")) {
        isPaidFilter = false;
    } else if (keywords.includes("paid")) {
        isPaidFilter = true;
    }

    const orFilters = [];

    keywords.forEach(word => {
        if (word !== "free" && word !== "paid") {
            orFilters.push(
                { title: { $regex: word, $options: "i" } },
                { city: { $regex: word, $options: "i" } },
                { eventType: { $regex: word, $options: "i" } },
                { venue: { $regex: word, $options: "i" } }
            );
        }
    });

    if (isPaidFilter !== null) {
        orFilters.push({ isPaid: isPaidFilter });
    }

    const searchFilter = { $or: orFilters };

    try {
        const events = await Event.find(searchFilter);
        res.json(events);
    } catch (e) {
        res.status(500).json({ message: "Search failed", error: e.message });
    }
};

const filterEvents = async (req, res) => {
    try {
        const { city, eventType, isPaid } = req.query;

        const filter = {};
        if (city) filter.city = city;
        if (eventType) filter.eventType = eventType;
        if (isPaid !== undefined) filter.isPaid = isPaid === 'true'; 

        const events = await Event.find(filter);
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: "Error filtering events", error: err.message });
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
    updateEventVideo,
    searchEvents,
    filterEvents
}