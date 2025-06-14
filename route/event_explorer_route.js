const express = require("express");
const router = express.Router();
const { findAll, save, findById, deleteById, update, updateProfilePicture } = require("../controller/event_explorer_controller");
const eventExplorerValidation = require("../validation/event_explorer_validation");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "event_explorer_images")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({ storage })

router.get("/", findAll);
router.post("/", eventExplorerValidation, save);
router.get("/:id", authenticateToken, authorizeRole("event explorer"), findById);
router.delete("/:id", authenticateToken, authorizeRole("event explorer"), deleteById);
router.put("/:id", authenticateToken, authorizeRole("event explorer"), update);
router.put("/:id/profile-picture", authenticateToken, authorizeRole("event explorer"), upload.single("profilePicture"), updateProfilePicture);

module.exports = router;