const Booking = require("../model/booking");
const Event = require("../model/event");
const EventExplorer = require("../model/event_explorer");
const nodemailer = require("nodemailer");

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

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventExplorer = await EventExplorer.findById(eventExplorerId);
    if (!eventExplorer) {
      return res.status(404).json({ message: "Event explorer not found" });
    }

    const booking = new Booking({
      seats,
      eventId,
      eventExplorerId,
      eventDetails: {
        title: event.title,
        venue: event.venue,
        city: event.city,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        eventPhoto: event.eventPhoto,
      },
    });

    await booking.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      protocol: "smtp",
      auth: {
        user: "localloop2025@gmail.com",
        pass: "ejjpleiswwikbvmz"
      }
    });

    await transporter.sendMail({
      from: '"LocalLoop Support" <localloop2025@gmail.com>',
      to: eventExplorer.email,
      subject: "Booking Confirmation",
      html: `
        <h1>Thank you for your booking!</h1>
        <p>You have successfully booked <strong>${seats}</strong> seat(s) for <strong>${event.title}</strong>.</p>
        <p><strong>Venue:</strong> ${event.venue}, ${event.city}</p>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.startTime} - ${event.endTime}</p>
      `
    });

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

module.exports = {
  findAll,
  save,
  findByEventId,
  findUpcomingBooking,
  findPastBooking
}
