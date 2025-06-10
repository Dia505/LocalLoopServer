const express = require("express");
const router = express.Router();
const { findAll, save, findByEventExplorerId, getBookmarkCountByEventId, removeById } = require("../controller/bookmark_controller");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

router.get("/", findAll);
router.post("/", authenticateToken, authorizeRole("event explorer"), save);
router.get("/event-explorer", authenticateToken, authorizeRole("event explorer"), findByEventExplorerId);
router.get("/event/:eventId", authenticateToken, authorizeRole("event organizer"), getBookmarkCountByEventId);
router.delete("/:id", authenticateToken, authorizeRole("event explorer"), removeById);

module.exports = router;