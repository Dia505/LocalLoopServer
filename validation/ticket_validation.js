const joi = require("joi");

const ticketSchema = joi.object({
    ticketType: joi.string().required(),
    ticketPrice: joi.number().min(1).required(),
    ticketQuantity: joi.number().min(1).required(),
    sold: joi.number(),
    eventId: joi.string().required()
});

function ticketValidation(req, res, next) {
    const { error } = ticketSchema.validate(req.body);
    if(error) {
        return res.json(error)
    }
    next()
}

module.exports = ticketValidation;