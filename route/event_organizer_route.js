const express = require("express");
const router = express.Router();
const { findAll, save, findById, deleteById, update, updateProfilePicture } = require("../controller/event_organizer_controller");
const eventOrganizerValidation = require("../validation/event_organizer_validation");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "event_organizer_images")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage })

router.get("/", findAll);
router.post("/", authenticateToken, authorizeRole("event organizer"), upload.single("profilePicture"), eventOrganizerValidation, save);
router.get("/:id", authenticateToken, authorizeRole("event organizer"), findById);
router.delete("/:id", authenticateToken, authorizeRole("event organizer"), deleteById);
router.put("/:id", authenticateToken, authorizeRole("event organizer"), update);
router.put("/:id/profile-picture", authenticateToken, authorizeRole("event organizer"), upload.single("profilePicture"), updateProfilePicture);

module.exports = router;