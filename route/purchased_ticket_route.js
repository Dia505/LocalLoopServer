const express = require("express");
const router = express.Router();
const { findAll, save, findById, findByEventExplorerId, findUpcomingPurchasedTickets, findPastPurchasedTickets } = require("../controller/purchased_ticket_controller");
const { authenticateToken } = require("../security/auth")
const { authorizeRole } = require("../security/auth");

router.get("/", findAll);
router.get("/event-explorer/:eventExplorerId", findByEventExplorerId);
router.get("/:id", findById);
router.post("/", authenticateToken, authorizeRole("event explorer"), save);
router.get("/upcoming-purchased-tickets", authenticateToken, authorizeRole("event explorer"), findUpcomingPurchasedTickets);
router.get("/past-purchased-tickets", authenticateToken, authorizeRole("event explorer"), findPastPurchasedTickets);

module.exports = router;
