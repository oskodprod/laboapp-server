const mongoose = require('mongoose');
const uValidator = require('mongoose-unique-validator');

const User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
});
User.schema.plugin(uValidator);
module.exports = User