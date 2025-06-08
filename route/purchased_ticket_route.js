const express = require("express");
const router = express.Router();
const { findAll, save, findById, findByEventExplorerId, findUpcomingPurchasedTickets, findPastPurchasedTickets } = require("../controller/purchased_ticket_controller");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

router.get("/", findAll);
router.post("/", authenticateToken, authorizeRole("event explorer"), save);
router.get("/upcoming", authenticateToken, authorizeRole("event explorer"), findUpcomingPurchasedTickets);
router.get("/past", authenticateToken, authorizeRole("event explorer"), findPastPurchasedTickets);
router.get("/event-explorer/:eventExplorerId", findByEventExplorerId);
router.get("/:id", findById);

module.exports = router;
