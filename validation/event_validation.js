const joi = require("joi");

const eventSchema = joi.object({
    title: joi.string().required(),
    subtitle: joi.string().max(300).required(),
    eventType: joi.string().required(),
    venue: joi.string().required(),
    address: joi.string().required(),
    city: joi.string().required(),
    date: joi.date().min('now').required(),
    startTime: joi.string().required(),
    endTime: joi.string(),
    isPaid: joi.boolean().required(),
    totalSeats: joi.number().min(1)
});

function eventValidation(req, res, next) {
    const {title, subtitle, eventType, venue, address, city, date, startTime, endTime, isPaid, totalSeats} = req.body;
    const error = eventSchema.validate({title, subtitle, eventType, venue, address, city, date, startTime, endTime, isPaid, totalSeats});

    if(error) {
        return res.json(error)
    }
    next()
}

module.exports = eventValidation;