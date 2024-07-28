//model protokołu pobrania

const mongoose = require("mongoose");
const uValidator = require("mongoose-unique-validator")
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const samplingSchema = new mongoose.Schema({
    docDate: { type: Date, default: Date.now },
    sid: { type: String, unique: true },
    labrat: { type: mongoose.Schema.Types.ObjectId, ref: 'Labrat'}, //kto wystawił protokół, tylko imię i nazwisko
    comments: String,
    samples: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sample' }],
    rec: { type: mongoose.Schema.Types.ObjectId, ref: 'Rec' },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    sidHead: String,
    sidLP: Number,
    loc: [String],
    locDesc: String,
    sxMak: String,
    mak: String
});
samplingSchema.plugin(deepPopulate, {
    populate: {
        'labrat.user': {
            select: '-password'
        },
        'client.user': {
            select: '-password'
        },
        'samples.client.user': {
            select: '-password'
        }

    }
});
samplingSchema.plugin(uValidator);
var Sampling = mongoose.model("Sampling", samplingSchema);
module.exports = Sampling;