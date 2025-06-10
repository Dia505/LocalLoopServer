require("dotenv").config();

const express = require("express");
const app = express();
const connectDb = require("./config/db");
const path = require("path");

connectDb();

require("./scheduled_jobs/auto_delete_archive");

app.use(express.json());

const authRouter = require("./route/auth_route");
const eventExplorerRouter = require("./route/event_explorer_route");
const eventOrganizerRouter = require("./route/event_organizer_route");
const eventRouter = require("./route/event_route");
const ticketRouter = require("./route/ticket_route");
const purchasedTicketRouter = require("./route/purchased_ticket_route");
const bookingRouter = require("./route/booking_route");
const bookmarkRouter = require("./route/bookmark_route");

app.use("/api/auth", authRouter);
app.use("/api/event-explorer", eventExplorerRouter);
app.use("/api/event-organizer", eventOrganizerRouter);
app.use("/api/event", eventRouter);
app.use("/api/ticket", ticketRouter);
app.use("/api/purchased-ticket", purchasedTicketRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/bookmark", bookmarkRouter);

app.use("/event-explorer-images", express.static(path.join(__dirname, "event_explorer_images")));
app.use("/event-organizer-images", express.static(path.join(__dirname, "event_organizer_images")));
app.use("/event-images", express.static(path.join(__dirname, "event_images")));
app.use("/event-videos", express.static(path.join(__dirname, "event_videos")));

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

module.exports = { app };