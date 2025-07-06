const express = require("express");
const router = express.Router();
const { findAll, save, findByEventId, deleteById, deleteByEventId, update, totalTicketsOfUpcomingEvents, checkSoldOut, getTicketAvailability } = require("../controller/ticket_controller");
const ticketValidation = require("../validation/ticket_validation");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

router.get("/", findAll);
router.post("/", authenticateToken, authorizeRole("event organizer"), ticketValidation, save);
router.get("/event/:eventId", findByEventId);
router.delete("/:id", authenticateToken, authorizeRole("event organizer"), deleteById);
router.delete("/event/:id", authenticateToken, authorizeRole("event organizer"), deleteByEventId);
router.put("/:id", authenticateToken, authorizeRole("event organizer"), update);
router.get("/upcoming-events/total-tickets/:eventOrganizerId", authenticateToken, authorizeRole("event organizer"), totalTicketsOfUpcomingEvents);
router.get("/soldOut/:eventId", checkSoldOut);
router.get("/ticket-availability/:eventId", authenticateToken, authorizeRole("event explorer"), getTicketAvailability);

module.exports = router;