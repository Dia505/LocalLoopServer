const cron = require("node-cron");
const Bookmark = require("../model/bookmark");
const Event = require("../model/event"); 

cron.schedule("0 * * * *", async () => {  // runs every hour
  try {
    const now = new Date();

    const fiveDaysLater = new Date(now);
    fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);

    const oneDayLater = new Date(now);
    oneDayLater.setDate(oneDayLater.getDate() + 1);

    // Events exactly 5 days away
    const fiveDayEvents = await Event.find({
      date: {
        $gte: new Date(fiveDaysLater.setHours(0, 0, 0, 0)),
        $lt: new Date(fiveDaysLater.setHours(23, 59, 59, 999))
      }
    });

    // Events exactly 1 day away
    const oneDayEvents = await Event.find({
      date: {
        $gte: new Date(oneDayLater.setHours(0, 0, 0, 0)),
        $lt: new Date(oneDayLater.setHours(23, 59, 59, 999))
      }
    });

    // Set 5-day notification flags for bookmarks of those events
    for (const event of fiveDayEvents) {
      await Bookmark.updateMany(
        { eventId: event._id },
        { 
          $set: { 
            notifiedFiveDaysBefore: true,
            notifiedFiveDaysRead: false  // reset read so notification shows again
          }
        }
      );
    }

    // Set 1-day notification flags for bookmarks of those events
    for (const event of oneDayEvents) {
      await Bookmark.updateMany(
        { eventId: event._id },
        { 
          $set: { 
            notifiedOneDayBefore: true,
            notifiedOneDayRead: false
          }
        }
      );
    }

    console.log("Notification flags updated.");
  } catch (error) {
    console.error("Cron job error:", error);
  }
});
