const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BookSchema = new Schema({
    name: String,
    author: String,
    category: String,
    status: String,
    price: Number
});

module.exports = mongoose.model('book', BookSchema);