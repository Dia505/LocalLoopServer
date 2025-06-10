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
        const bookmark = await Bookmark.find({ eventExplorerId }).populate("eventExplorerId").populate("eventId");
        res.status(200).json(bookmark);
    }
    catch (e) {
        res.json(e)
    }
}

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

module.exports = {
    findAll,
    save,
    findByEventExplorerId,
    getBookmarkCountByEventId,
    removeById
}