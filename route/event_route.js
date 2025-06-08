const express = require("express");
const router = express.Router();
const { findAll, save, findById, findByEventOrganizerId, deleteById, update, updateEventPhoto, updateEventVideo, searchEvents, filterEvents } = require("../controller/event_controller");
const eventValidation = require("../validation/event_validation");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "event_images");
    } else if (file.mimetype.startsWith("video/")) {
      cb(null, "event_videos");
    } else {
      cb(new Error("Invalid file type"), null);
    }
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

router.get("/search", searchEvents);
router.get("/filter", filterEvents);
router.get("/", findAll);
router.post("/", authenticateToken, authorizeRole("event organizer"), upload.fields([{ name: "eventPhoto", maxCount: 1 }, { name: "eventVideo", maxCount: 5 }]), eventValidation, save);
router.get("/:id", authenticateToken, authorizeRole("event organizer", "event explorer"), findById);
router.get("/event-organizer/:eventOrganizerId", authenticateToken, authorizeRole("event organizer", "event explorer"), findByEventOrganizerId);
router.delete("/:id", authenticateToken, authorizeRole("event organizer"), deleteById);
router.put("/:id", authenticateToken, authorizeRole("event organizer"), update);
router.put("/:id/event-photo", authenticateToken, authorizeRole("event organizer"), upload.single("eventPhoto"), updateEventPhoto);
router.put("/:id/event-video", authenticateToken, authorizeRole("event organizer"), upload.array("eventVideo", 5), updateEventVideo);

module.exports = router;