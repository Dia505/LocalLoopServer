const express = require("express");
const router = express.Router();
const { findAll, save, findByEventId, deleteById, update } = require("../controller/ticket_controller");
const ticketValidation = require("../validation/ticket_validation");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

router.get("/", findAll);
router.post("/", authenticateToken, authorizeRole("event organizer"), ticketValidation, save);
router.get("/event/:eventId", findByEventId);
router.delete("/:id", authenticateToken, authorizeRole("event organizer"), deleteById);
router.put("/:id", authenticateToken, authorizeRole("event organizer"), update);

module.exports = router;