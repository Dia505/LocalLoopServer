const PurchasedTicket = require("../model/purchased_ticket");
const Ticket = require("../model/ticket");
const EventExplorer = require("../model/event_explorer");
const nodemailer = require("nodemailer");

const findAll = async (req, res) => {
  try {
    const purchasedTicket = await PurchasedTicket.find()
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId"
        }
      }).populate("eventExplorerId");
    res.status(200).json(purchasedTicket);
  }
  catch (e) {
    res.json(e)
  }
}

const save = async (req, res) => {
  try {
    const { ticketId, quantity, paymentMethod } = req.body;

    const eventExplorerId = req.user.id;

    const ticket = await Ticket.findById(ticketId).populate("eventId");
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const eventExplorer = await EventExplorer.findById(eventExplorerId);
    if (!eventExplorer) {
      return res.status(404).json({ message: "Event explorer not found" });
    }

    const totalPrice = ticket.ticketPrice * quantity;

    //Increment "sold" column of the ticket
    ticket.sold += quantity;
    await ticket.save();

    const purchasedTicket = new PurchasedTicket({
      ticketId,
      ticketDetails: {
        ticketType: ticket.ticketType,
        ticketPrice: ticket.ticketPrice
      },
      eventDetails: {
        title: ticket.eventId.title,
        venue: ticket.eventId.venue,
        city: ticket.eventId.city,
        date: ticket.eventId.date,
        startTime: ticket.eventId.startTime,
        endTime: ticket.eventId.endTime,
        eventPhoto: ticket.eventId.eventPhoto,
      },
      quantity,
      totalPrice,
      paymentMethod,
      eventExplorerId
    });

    await purchasedTicket.save();

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
      subject: "Ticket Purchase Confirmation",
      html: `
            <h1>Thank you for your purchase!</h1>
            <p>You have successfully purchased <strong>${quantity}</strong> ticket(s) for <strong>${ticket.eventId.title}</strong>.</p>
            <p><strong>Venue:</strong> ${ticket.eventId.venue}, ${ticket.eventId.city}</p>
            <p><strong>Date:</strong> ${new Date(ticket.eventId.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${ticket.eventId.startTime} - ${ticket.eventId.endTime}</p>
          `
    });

    res.status(201).json(purchasedTicket);
  } catch (e) {
    res.status(500).json({ message: "Error purchasing ticket", error: e.message });
  }
};

const findById = async (req, res) => {
  try {
    const purchasedTicket = await PurchasedTicket.findById(req.params.id)
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId"
        }
      }).populate("eventExplorerId");
    res.status(200).json(purchasedTicket);
  }
  catch (e) {
    res.json(e)
  }
}

const findByEventExplorerId = async (req, res) => {
  try {
    const { eventExplorerId } = req.params;
    const puchasedTicket = await PurchasedTicket.find({ eventExplorerId })
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId"
        }
      }).populate("eventExplorerId");
    res.status(200).json(puchasedTicket);
  }
  catch (e) {
    res.json(e)
  }
}

const findUpcomingPurchasedTickets = async (req, res) => {
  try {
    const eventExplorerId = req.user.id;
    const now = new Date();

    const purchasedTickets = await PurchasedTicket.find({ eventExplorerId })
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId"
        }
      })
      .populate("eventExplorerId");

    // Filter based on copied eventDetails.date (fallback)
    const filteredTickets = purchasedTickets.filter(pt => {
      // Use copied date from purchased ticket document, which always exists
      return pt.eventDetails.date && new Date(pt.eventDetails.date) >= now;
    });

    res.status(200).json(filteredTickets);
  } catch (e) {
    res.status(500).json({ message: "Error fetching upcoming tickets", error: e.message });
  }
};

const findPastPurchasedTickets = async (req, res) => {
  try {
    const eventExplorerId = req.user.id;
    const now = new Date();

    const purchasedTickets = await PurchasedTicket.find({ eventExplorerId })
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId"
        },
      })
      .populate("eventExplorerId");

    // Filter based on the saved eventDetails.date
    const filteredTickets = purchasedTickets.filter(pt => {
      return pt.eventDetails.date && new Date(pt.eventDetails.date) < now;
    });

    res.status(200).json(filteredTickets);
  } catch (e) {
    res.status(500).json({ message: "Error fetching past tickets", error: e.message });
  }
};

const deleteById = async (req, res) => {
  try {
    const deletedPurchasedTicket = await PurchasedTicket.findByIdAndDelete(req.params.id);

    const ticketId = deletedPurchasedTicket.ticketId;
    const quantity = deletedPurchasedTicket.quantity;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.sold -= quantity;
    await ticket.save();

    if (!deletedPurchasedTicket) {
      return res.status(404).json({ message: "Purchased ticket not found" });
    }

    res.status(200).json({ message: "Purchased ticket deleted successfully" });
  } catch (e) {
    console.error("Delete Error:", e);
    res.status(500).json({ message: "An error occurred while deleting the purchased ticket", error: e.message });
  }
};

module.exports = {
  findAll,
  save,
  findById,
  findByEventExplorerId,
  findUpcomingPurchasedTickets,
  findPastPurchasedTickets,
  deleteById
}

