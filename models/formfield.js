//model pozycji formularza

const mongoose = require("mongoose");

const formfieldSchema = new mongoose.Schema({
    category: String,
    value: String
});

var Formfield = mongoose.model("Formfield", formfieldSchema);
module.exports = Formfield;