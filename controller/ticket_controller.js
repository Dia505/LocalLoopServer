const Ticket = require("../model/ticket");
const Event = require("../model/event");

const findAll = async (req, res) => {
    try {
        const ticket = await Ticket.find().populate("eventId");
        res.status(200).json(ticket);
    }
    catch (e) {
        res.json(e)
    }
}

const save = async (req, res) => {
    try {
        const ticket = new Ticket(req.body);
        await ticket.save();
        res.status(201).json(ticket)
    }
    catch (e) {
        res.json(e)
    }
}

const findByEventId = async (req, res) => {
    try {
        const { eventId } = req.params;
        const ticket = await Ticket.find({ eventId }).populate("eventId");
        res.status(200).json(ticket);
    }
    catch (e) {
        res.json(e)
    }
}

const deleteById = async (req, res) => {
    try {
        const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);

        if (!deletedTicket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.status(200).json({ message: "Ticket deleted successfully" });
    } catch (e) {
        console.error("Delete Error:", e);
        res.status(500).json({ message: "An error occurred while deleting the icket", error: e.message });
    }
};

const update = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(201).json(ticket);
    }
    catch (e) {
        res.json(e)
    }
}

const totalTicketsOfUpcomingEvents = async (req, res) => {
  try {
    const { eventOrganizerId } = req.params;

    const now = new Date();
    const upcomingEvents = await Event.find({
      eventOrganizerId,
      date: { $gt: now } 
    });

    const eventIds = upcomingEvents.map(event => event._id);

    const tickets = await Ticket.find({ eventId: { $in: eventIds } });

    const totalTicketsSold = tickets.reduce((sum, ticket) => sum + (ticket.sold || 0), 0);

    return res.status(200).json({ totalTicketsSold });
  } catch (err) {
    return res.status(500).json({ message: "Failed to calculate total tickets sold", error: err.message });
  }
};

module.exports = {
    findAll,
    save,
    findByEventId,
    deleteById,
    update,
    totalTicketsOfUpcomingEvents
}