const Ticket = require("../model/ticket");

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

module.exports = {
    findAll,
    save,
    findByEventId,
    deleteById,
    update
}