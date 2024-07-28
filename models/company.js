//model firmy

const mongoose = require("mongoose");
const uValidator = require("mongoose-unique-validator");

const companySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    address: { type: String, required:true },
    postalcode: { type: String, required: true },
    city: { type: String, required: true },
    nip: { type: String, required: true },
    category: { type: String, required: true }
});

companySchema.plugin(uValidator);
var Company = mongoose.model('Company', companySchema);
module.exports = Company;