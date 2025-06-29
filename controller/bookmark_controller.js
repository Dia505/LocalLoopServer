const Bookmark = require("../model/bookmark");

const findAll = async (req, res) => {
    try {
        const bookmark = await Bookmark.find().populate("eventExplorerId").populate("eventId");
        res.status(200).json(bookmark);
    }
    catch (e) {
        res.json(e)
    }
}

const save = async (req, res) => {
    try {
        const { eventId } = req.body;
        const eventExplorerId = req.user.id;

        const bookmark = new Bookmark({
            eventId,
            eventExplorerId
        });

        await bookmark.save();
        res.status(201).json(bookmark);
    }
    catch (e) {
        res.status(500).json({ message: "Error bookmarking event", error: e.message });
    }
};

const findByEventExplorerId = async (req, res) => {
    try {
        const eventExplorerId = req.user.id;

        const bookmarks = await Bookmark.find({ eventExplorerId })
            .populate({
                path: "eventId",
                match: { date: { $gte: new Date() } }, // <-- Only upcoming events
            })
            .populate("eventExplorerId");

        // Filter out any bookmarks where eventId is null (i.e., filtered out by `match`)
        const upcomingBookmarks = bookmarks.filter(b => b.eventId !== null);

        res.status(200).json(upcomingBookmarks);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};


const getBookmarkCountByEventId = async (req, res) => {
    try {
        const { eventId } = req.params;

        const count = await Bookmark.countDocuments({ eventId }).populate("eventExplorerId").populate("eventId");

        res.status(200).json({ eventId, totalBookmarks: count });
    } catch (e) {
        res.status(500).json({ message: "Error counting bookmarks", error: e.message });
    }
};

const removeById = async (req, res) => {
    try {
        const bookmark = await Bookmark.findByIdAndDelete(req.params.id);

        if (!bookmark) {
            return res.status(404).json({ message: "Bookmark not found" });
        }

        res.status(200).json({ message: "Bookmark removed successfully" });
    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ message: "An error occurred while removing the bookmark", error: e.message });
    }
};

const getPendingNotifications = async (req, res) => {
    try {
        const eventExplorerId = req.user._id;

        const pendingBookmarks = await Bookmark.find({
            eventExplorerId: eventExplorerId,
            $or: [
                { notifiedFiveDaysBefore: true, notifiedFiveDaysRead: false },
                { notifiedOneDayBefore: true, notifiedOneDayRead: false }
            ]
        }).populate('eventId').populate('eventId.eventOrganizerId');

        res.status(200).json(pendingBookmarks);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending notifications" });
    }
};

const markNotificationRead = async (req, res) => {
    try {
        const { bookmarkId, notificationType } = req.body;

        const updateFields = {};

        if (notificationType === "fiveDays") {
            updateFields.notifiedFiveDaysRead = true;
        } else if (notificationType === "oneDay") {
            updateFields.notifiedOneDayRead = true;
        } else {
            return res.status(400).json({ error: "Invalid notification type" });
        }

        await Bookmark.findByIdAndUpdate(bookmarkId, updateFields);

        res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

module.exports = {
    findAll,
    save,
    findByEventExplorerId,
    getBookmarkCountByEventId,
    removeById,
    getPendingNotifications,
    markNotificationRead
}