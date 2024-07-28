const mongoose = require("mongoose");

const labratSchema = new mongoose.Schema({
    pName: String,
    lastname: String,
    iniShort: String,
    isAdmin: Boolean,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    labo: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

var Labrat = mongoose.model('Labrat', labratSchema);
module.exports = Labrat;