const Booking = require("../model/booking");

const findAll = async (req, res) => {
  try {
    const booking = await Booking.find().populate("eventId").populate("eventExplorerId");
    res.status(200).json(booking);
  }
  catch (e) {
    res.json(e)
  }
}

const save = async (req, res) => {
  try {
    const { eventId, seats } = req.body;

    const eventExplorerId = req.user.id;

    const booking = new Booking({
      seats,
      eventId,
      eventExplorerId
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (e) {
    res.status(500).json({ message: "Error booking seats", error: e.message });
  }
};

const findByEventId = async (req, res) => {
    try {
        const { eventId } = req.params;
        const booking = await Booking.find({ eventId }).populate("eventId").populate("eventExplorerId");
        res.status(200).json(booking);
    }
    catch (e) {
        res.json(e)
    }
}

const findUpcomingBooking = async (req, res) => {
  try {
    const eventExplorerId = req.user.id;
    const now = new Date();

    const upcomingBookings = await Booking.find({ eventExplorerId })
      .populate({
        path: "eventId",
        match: { date: { $gte: now } }
      })
      .populate("eventExplorerId");

    // Filter out bookings where eventId was not matched (because event is past)
    const filteredBookings = upcomingBookings.filter(pt => pt.eventId !== null);

    res.status(200).json(filteredBookings);
  } catch (e) {
    res.status(500).json({ message: "Error fetching upcoming bookings", error: e.message });
  }
};

const findPastBooking = async (req, res) => {
  try {
    const eventExplorerId = req.user.id;
    const now = new Date();

    const pastBookings = await Booking.find({ eventExplorerId })
      .populate({
        path: "eventId",
        match: { date: { $lt: now } }
      })
      .populate("eventExplorerId");

    // Filter out bookings where eventId was not matched (because event is past)
    const filteredBookings = pastBookings.filter(pt => pt.eventId !== null);

    res.status(200).json(filteredBookings);
  } catch (e) {
    res.status(500).json({ message: "Error fetching past bookings", error: e.message });
  }
};

module.exports({
    findAll,
    save,
    findByEventId,
    findUpcomingBooking,
    findPastBooking
})
