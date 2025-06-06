require("dotenv").config();

const express = require("express");
const app = express();
const connectDb = require("./config/db");
const path = require("path");

connectDb();

const eventExplorerRouter = require("./route/event_explorer_route");

app.use(express.json());

app.use("/api/event-explorer", eventExplorerRouter)

const eventExplorerImagesPath = path.join(__dirname, "event_explorer_images");

app.use("/event_explorer_images", express.static(eventExplorerImagesPath));

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})

module.exports = { app };