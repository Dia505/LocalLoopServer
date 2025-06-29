require("dotenv").config();

const express = require("express");
const app = express();
const connectDb = require("./config/db");
const path = require("path");
const cors = require("cors");

connectDb();

app.use(cors({
  origin: "http://localhost:5173",
  methods: "GET,POST,PUT,DELETE", // Allowed HTTP methods
  credentials: true,              // Allow cookies
}));
app.use(express.json());

require("./scheduled_jobs/auto_delete_archive");
require("./scheduled_jobs/bookmark_notification");

app.use(express.json());

const authRouter = require("./route/auth_route");
const eventExplorerRouter = require("./route/event_explorer_route");
const eventOrganizerRouter = require("./route/event_organizer_route");
const eventRouter = require("./route/event_route");
const ticketRouter = require("./route/ticket_route");
const purchasedTicketRouter = require("./route/purchased_ticket_route");
const bookingRouter = require("./route/booking_route");
const bookmarkRouter = require("./route/bookmark_route");
const galleryRouter = require("./route/gallery_route");

app.use("/api/auth", authRouter);
app.use("/api/event-explorer", eventExplorerRouter);
app.use("/api/event-organizer", eventOrganizerRouter);
app.use("/api/event", eventRouter);
app.use("/api/ticket", ticketRouter);
app.use("/api/purchased-ticket", purchasedTicketRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/bookmark", bookmarkRouter);
app.use("/api/gallery", galleryRouter);

app.use("/event-explorer-images", express.static(path.join(__dirname, "event_explorer_images")));
app.use("/event-organizer-images", express.static(path.join(__dirname, "event_organizer_images")));
app.use("/event-images", express.static(path.join(__dirname, "event_images")));
app.use("/event-videos", express.static(path.join(__dirname, "event_videos")));
app.use("/gallery-images", express.static(path.join(__dirname, "gallery_images")));
app.use("/gallery-cover-images", express.static(path.join(__dirname, "gallery_cover_images")));
app.use("/gallery-company-images", express.static(path.join(__dirname, "gallery_company_images")));

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

module.exports = { app };