const PurchasedTicket = require("../model/purchased_ticket");
const Ticket = require("../model/ticket");

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

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        const totalPrice = ticket.ticketPrice * quantity;

        //Increment "sold" column of the ticket
        ticket.sold += quantity;
        await ticket.save();

        const purchasedTicket = new PurchasedTicket({
            ticketId,
            quantity,
            totalPrice,
            paymentMethod,
            eventExplorerId
        });

        await purchasedTicket.save();
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

    const upcomingTickets = await PurchasedTicket.find({ eventExplorerId })
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId",
          match: { date: { $gte: now } }, 
        },
      })
      .populate("eventExplorerId");

    // Filter out tickets where eventId was not matched (because event is past)
    const filteredTickets = upcomingTickets.filter(pt => pt.ticketId.eventId !== null);

    res.status(200).json(filteredTickets);
  } catch (e) {
    res.status(500).json({ message: "Error fetching upcoming tickets", error: e.message });
  }
};

const findPastPurchasedTickets = async (req, res) => {
  try {
    const eventExplorerId = req.user.id;
    const now = new Date();

    const pastTickets = await PurchasedTicket.find({ eventExplorerId })
      .populate({
        path: "ticketId",
        populate: {
          path: "eventId",
          match: { date: { $lt: now } }, // event date is in the past
        },
      })
      .populate("eventExplorerId");

    const filteredTickets = pastTickets.filter(pt => pt.ticketId.eventId !== null);

    res.status(200).json(filteredTickets);
  } catch (e) {
    res.status(500).json({ message: "Error fetching past tickets", error: e.message });
  }
};


module.exports = {
    findAll,
    save,
    findById,
    findByEventExplorerId,
    findUpcomingPurchasedTickets,
    findPastPurchasedTickets
}

