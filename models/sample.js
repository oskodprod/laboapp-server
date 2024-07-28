//model próbki

const mongoose = require("mongoose");
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const uValidator = require('mongoose-unique-validator');
const sampleSchema = new mongoose.Schema({
    //INFORMACJE NA PROTOKOLE KARCIE I RAPORCIE
    date: { type: Date, required: true, default: Date.now }, //timestamp próbki
    chkDate: { type: Date, required: true, default: Date.now }, //data ściskania
    agTime: Number, //czas dojrzewania(do wyliczenia czasu badania)
    sxid: { type: String, unique: true }, //id próbki -> miesiąc/inicjał/numer
    sxHead: String,
    sxLP: Number,
    rec: { type: mongoose.Schema.Types.ObjectId, ref: 'Rec'}, //receptura
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },//budowa i kontakt do kierownika
    formSize: String, //opis foremki, kształt-wymiar

    //INFORMACJE NA PROTOKOLE
    tLoad: String, //czas załadunku mieszanki
    tCheck: String, //godziny badania
    airTemp: Number, //temperatura powietrza (D)
    mixTemp: Number, //temperatura mieszanki (D)
    formNo: String, //numer foremki
    thermo: String, //termometr

    //INFORMACJE NA KARCIE BADAŃ
    laboTemp: Number, //temperatura w laboratorium (D)
    
    precForm: Boolean, //precyzyjność foremek(false=nie true=tak)
    precSide: Boolean, //tolerancja pow. bocznych
    precUpDown: Boolean, //tolerancja góra-dół
    precFlat: Boolean, //płaskość pow. dociskanych(tylko przy nieprec formie)
    precPerpSide: Boolean, //prostopad. ścian bocznych(tylko przy nieprec formie)
    precComm: String, //uwagi do testu pomiarów
    
    wymComm: String, //uwagi do wymiarów próbki
    
    destSpeed: Number, //prędkość obciążenia w MPa/s (D)
    destSpeedCheck: Boolean, //spełnia lub nie
    destComm: String, //uwagi do zniszczenia kostki

    comm1: String, //dodatkowe uwagi do badań
    testedBy: String, //badanie próbki wykonał

    //INFORMACJE NA PROTOKOLE I KARCIE
    testCon: Number, //wartości stożka(protokół i karta)
    airPRC: Number, //zawartość powietrza w procentach(protokół i karta) (D)

    //INFORMACJE NA SPRAWOZDANIU
                                //I PROTOKOLE
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, //firma wykonująca próbke
    WZ: String, //numer WZ
    sCategory: Boolean, //rodzaj próbki(false = Z, true = P)
    loc: [String], //miejsce betonowane pozycja formularza
    locDesc: String,
                                //I KARCIE
    mass: Number, //masa w kg (D)
    wymA: Number, //wymiar A w mm (D)
    wymB: Number, //wymiar B w mm (D)
    wymC: Number, //wymiar C w mm (D)
    
    destForce: Number, //siła niszcząca w kN (D)
    destResult: Number, //wytrzymałość próbki w MPa(na podst. siły i wymiarów) (D)
    destType:String, //typ zniszczenia(prawidłowy lub nieprawidłowy(wg normy)) 
    
    mak: String, //metoda zagęszczenia
    sxMak: String, //próbki wykonał
    sampling: { type: mongoose.Schema.Types.ObjectId, ref: 'Sampling' }
}, { timestamps: true });

sampleSchema.plugin(deepPopulate, {
    populate: {
        'client.user': {
            select: '-password'
        }
    }
});
sampleSchema.plugin(uValidator);
var Sample = mongoose.model('Sample', sampleSchema);
module.exports = Sample;
