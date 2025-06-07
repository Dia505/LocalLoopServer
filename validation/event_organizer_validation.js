const joi = require("joi");

const eventOrganizerSchema = joi.object({
    fullName: joi.string().required(),
    mobileNumber: joi.string().pattern(/^9[678]\d{8}$/).required(),
    email: joi.string().email().required(),
    password: joi.string()
        .min(8)
        .pattern(new RegExp('(?=.*[a-z])'))      
        .pattern(new RegExp('(?=.*[A-Z])'))      
        .pattern(new RegExp('(?=.*[0-9])'))     
        .pattern(new RegExp('(?=.*[!@#$%^&*])')) 
        .required(),
    companyName: joi.string().required(),
    businessType: joi.string().required(),
    panNumber: joi.string().required(),
    address: joi.string().required(),
    city: joi.string().required(),
    contactNumber: joi.string().required(),
    companyEmail: joi.string().required(),
});

function eventOrganizerValidation(req, res, next) {
    const {fullName, mobileNumber, email, password, companyName, businessType, panNumber, address, city, contactNumber, companyEmail} = req.body;
    const {error} = eventOrganizerSchema.validate({fullName, mobileNumber, email, password, companyName, businessType, panNumber, address, city, contactNumber, companyEmail})

    if(error) {
        return res.json(error)
    }
    next()
}

module.exports = eventOrganizerValidation;

