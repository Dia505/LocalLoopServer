const express = require("express");
const router = express.Router();
const { findAll, save, findById, findByEventOrganizerId, deleteById, update, updateEventPhoto, updateEventVideo } = require("../controller/event_controller");
const eventValidation = require("../validation/event_validation");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

const multer = require("multer");

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "event_images"),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "event_videos"),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const imageUpload = multer({ storage: imageStorage });
const videoUpload = multer({ storage: videoStorage });

router.get("/", findAll);
router.post("/", imageUpload.single("eventPhoto"), videoUpload.array("eventVideo", 5), eventValidation, save);
router.get("/:id", authenticateToken, authorizeRole("event organizer"), findById);
router.get("/event-organizer/:eventOrganizerId", authenticateToken, authorizeRole("event organizer"), findByEventOrganizerId);
router.delete("/:id", authenticateToken, authorizeRole("event organizer"), deleteById);
router.put("/:id", authenticateToken, authorizeRole("event organizer"), update);
router.put("/:id/event-photo", authenticateToken, authorizeRole("event organizer"), imageUpload.single("eventPhoto"), updateEventPhoto);
router.put("/:id/event-video", authenticateToken, authorizeRole("event organizer"), videoUpload.array("eventVideo", 5), updateEventVideo);

module.exports = router;