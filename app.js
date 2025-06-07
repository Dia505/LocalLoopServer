require("dotenv").config();

const express = require("express");
const app = express();
const connectDb = require("./config/db");
const path = require("path");

connectDb();

app.use(express.json());

const eventExplorerRouter = require("./route/event_explorer_route");
const eventOrganizerRouter = require("./route/event_organizer_route");
const eventRouter = require("./route/event_route");

app.use("/api/event-explorer", eventExplorerRouter);
app.use("/api/event-organizer", eventOrganizerRouter);
app.use("/api/event", eventRouter);

app.use("/event-explorer-images", express.static(path.join(__dirname, "event_explorer_images")));
app.use("/event-organizer-images", express.static(path.join(__dirname, "event_organizer_images")));
app.use("/event-images", express.static(path.join(__dirname, "event_images")));
app.use("/event-videos", express.static(path.join(__dirname, "event_videos")));

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

module.exports = { app };