require("dotenv").config();

const express = require("express");
const app = express();
const connectDb = require("./config/db");
const path = require("path");

connectDb();

app.use(express.json());

const eventExplorerRouter = require("./route/event_explorer_route");
const eventOrganizerRouter = require("./route/event_organizer_route");

app.use("/api/event-explorer", eventExplorerRouter)
app.use("/api/event-organizer", eventOrganizerRouter)

const eventExplorerImagesPath = path.join(__dirname, "event_explorer_images");
app.use("/event_explorer_images", express.static(eventExplorerImagesPath));

const eventOrganizerImagesPath = path.join(__dirname, "event_organizer_images");
app.use("/event_organizer_images", express.static(eventOrganizerImagesPath));

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

module.exports = { app };