const mongoose = require("mongoose");
const uValidator = require('mongoose-unique-validator');

const clientSchema = new mongoose.Schema({
    clName: { type: String, unique: true },
    clAddress: String,
    clCity: String,
    short: String,
    iniShort: String,
    cid: { type: String, unique: true },
    contactname: String,
    contactlastname: String,
    contactTelNo: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

clientSchema.plugin(uValidator);
var Client = mongoose.model('Client', clientSchema);
module.exports = Client;