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
    const { error, value } = eventSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({ message: "Validation failed", details: error.details });
    }

    req.body = value; 
    next();
}

module.exports = eventValidation;