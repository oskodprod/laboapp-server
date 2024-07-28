const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const url = process.env.DB_URI;
    // Connect MongoDB at default port 27017.
let mong = mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}, (err) => {
    if (!err) {
        console.log(`MongoDB Connected at ${url}.`)
    } else {
        console.log('Error in DB connection: ' + err)
    }
});