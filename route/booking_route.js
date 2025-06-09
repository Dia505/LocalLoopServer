const express = require("express");
const router = express.Router();
const { findAll, save, findByEventId, findUpcomingBooking, findPastBooking } = require("../controller/booking_controller");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

router.get("/", findAll);
router.post("/", authenticateToken, authorizeRole("event explorer"), save);
router.get("/upcoming", authenticateToken, authorizeRole("event explorer"), findUpcomingBooking);
router.get("/past", authenticateToken, authorizeRole("event explorer"), findPastBooking);
router.get("/event/:eventId", findByEventId);

module.exports = router;