const cron = require("node-cron");
const Event = require("./models/Event");
const Ticket = require("./models/Ticket");

cron.schedule("0 0 * * *", async () => {
    try {
        const now = new Date();
        const thresholdDate = new Date(now.setDate(now.getDate() - 30));

        const archivedEvents = await Event.find({ archivedDate: { $lte: thresholdDate } });

        for (const event of archivedEvents) {
            // Delete related tickets if event was paid
            if (event.isPaid) {
                await Ticket.deleteMany({ eventId: event._id });
            }

            // Delete the event itself
            await Event.findByIdAndDelete(event._id);
        }

        console.log(`[CRON] Deleted ${archivedEvents.length} archived events and their tickets (if paid).`);
    } catch (error) {
        console.error("[CRON] Error cleaning up archived events:", error);
    }
});
