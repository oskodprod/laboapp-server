//model sprawozdania

const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const uValidator = require('mongoose-unique-validator');
const reportSchema = new mongoose.Schema({
    docDate: { type: Date, required: true, default: Date.now }, //data wystawienia raportu
    rid: String, //id raportu(na podst pierwszej próbki na liście)
    sampling: { type: mongoose.Schema.Types.ObjectId, ref: 'Sampling', unique: true },
    samples: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sample' }],
    avgEnd: Number, //wytrzymałość średnia (D)
    fckEnd: Number, //wytrzymałość charakterystyczna (D)
    minEnd: Number, //minimalna wytrzymałość (D)
    odchStd: { type: Number, default: 0.1 }, //odchylenie standardowe (D)
    niepewnosc: { type: Number, default: 0.5 }, //niepewność rozszerzona (D)
    createdBy: String
});
reportSchema.plugin(deepPopulate, {
    populate: {
        'sampling.labrat.user': {
            select: '-password'
        },
        'sampling.client.user': {
            select: '-password'
        },
        'sampling': {
            select: '-samples'
        },
        'samples.client.user': {
            select: '-password'
        },
        'samples.user': {
            select: '-password'
        }
    }
});
reportSchema.plugin(uValidator);
var Report = mongoose.model('Report', reportSchema);
module.exports = Report;