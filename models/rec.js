//model receptury

const mongoose = require('mongoose');
const uValidator = require('mongoose-unique-validator');
const recSchema = new mongoose.Schema({
    
    recName: { type: String, unique: true }, //nazwa-kod receptury
    maker: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    clS: String, //ściskanie
    con: String, //konsystencja(S1-S5)
    clW: String, //wodoszczelność
    clF: String, //mrozoodporność
    cert: Boolean, //certyfikacja(false=nie, true=tak)
    agTime: { type: Number, default: 28 }, //czas dojrzewania
    clX: [String], //klasy ekspozycji
    clN: String, //nasiąkliwość[%]
    comments: String //dodatkowe szczegóły
});

recSchema.plugin(uValidator);
var Rec = mongoose.model('Rec', recSchema);
module.exports = Rec;