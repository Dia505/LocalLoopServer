const Event = require("../model/event");
const EventExplorer = require("../model/event_explorer");
const Ticket = require("../model/ticket"); 

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
        const eventOrganizerId = req.user.id;

        const eventData = {
            ...(req.body.value || req.body),
            eventPhoto: req.files["eventPhoto"] ? req.files["eventPhoto"][0].filename : undefined,
            eventVideo: req.files["eventVideo"] ? req.files["eventVideo"].map(file => file.filename) : [],
            eventOrganizerId
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

const findUpcomingEvents = async (req, res) => {
    try {
        const eventOrganizerId = req.user.id;
        const now = new Date();

        const events = await Event.find({
            eventOrganizerId,
            date: { $gte: now }
        }).populate("eventOrganizerId");

        res.status(200).json(events);
    } catch (e) {
        res.status(500).json({ message: "Error fetching upcoming events", error: e.message });
    }
};

const findUpcomingEventsByType = async (req, res) => {
    try {
        const { eventType } = req.query;
        if (!eventType) {
            return res.status(400).json({ message: "Missing eventType query parameter" });
        }

        const now = new Date();

        const events = await Event.find({
            eventType: eventType,
            date: { $gte: now }
        }).populate("eventOrganizerId");

        res.status(200).json(events);
    } catch (e) {
        res.status(500).json({ message: "Error fetching upcoming events by type", error: e.message });
    }
};

const findArchivedEvents = async (req, res) => {
    try {
        const eventOrganizerId = req.user.id;
        const now = new Date();

        // const events = await Event.find({
        //     eventOrganizerId,
        //     date: { $lt: now }
        // }).populate("eventOrganizerId");

        const events = await Event.find({
            eventOrganizerId,
            archivedDate: { $lte: now }
        }).populate("eventOrganizerId");

        res.status(200).json(events);
    } catch (e) {
        res.status(500).json({ message: "Error fetching archived events", error: e.message });
    }
};

const deleteById = async (req, res) => {
    try {
        const eventId = req.params.id;

        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        // If event was paid, delete its tickets
        if (deletedEvent.isPaid) {
            await Ticket.deleteMany({ eventId });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ message: "An error occurred while deleting the event", error: e.message });
    }
};

const update = async (req, res) => {
    try {
        const updateFields = { ...req.body };

        if (req.body.date) {
            const newDate = new Date(req.body.date);
            const archivedDate = new Date(newDate);
            archivedDate.setDate(archivedDate.getDate() + 1);

            updateFields.archivedDate = archivedDate;
        }

        const event = await Event.findByIdAndUpdate(req.params.id, updateFields, { new: true });
        res.status(201).json(event);
    } catch (e) {
        res.status(500).json({ message: "Error updating event", error: e.message });
    }
};

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

    try {
        const now = new Date();

        const searchFilter = {
            $or: orFilters,
            date: { $gte: now }  // only upcoming events
        };

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

        // Add filter for upcoming events (date today or later)
        filter.date = { $gte: new Date() };

        const events = await Event.find(filter);
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: "Error filtering events", error: err.message });
    }
};

const getHomeEvents = async (req, res) => {
    try {
        const now = new Date();
        let events = [];

        if (req.user && req.user.id) {
            // Logged-in user: get city from profile
            const eventExplorer = await EventExplorer.findById(req.user.id);
            const city = eventExplorer?.city;

            if (city) {
                // Find events in user city
                events = await Event.find({ city, date: { $gte: now } })
                    .sort({ date: 1 })
                    .limit(6);

                // If less than 6, fill with other cities
                if (events.length < 6) {
                    const remaining = 6 - events.length;

                    const fallbackEvents = await Event.find({ date: { $gte: now }, city: { $ne: city } })
                        .sort({ date: 1 })
                        .limit(remaining);

                    events = events.concat(fallbackEvents);
                }
            }
        }

        // If not logged in or city missing, show 6 random upcoming events
        if (!events.length) {
            events = await Event.aggregate([
                { $match: { date: { $gte: now } } },
                { $sample: { size: 6 } }
            ]);
        }

        res.json(events);
    } catch (e) {
        res.status(500).json({ message: "Error fetching home events", error: e.message });
    }
};

module.exports = {
    findAll,
    save,
    findById,
    findByEventOrganizerId,
    findUpcomingEvents,
    findUpcomingEventsByType,
    findArchivedEvents,
    deleteById,
    update,
    updateEventPhoto,
    updateEventVideo,
    searchEvents,
    filterEvents,
    getHomeEvents
}