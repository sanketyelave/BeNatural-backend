// models/product.js
const mongoose = require('mongoose');

const product = new mongoose.Schema({
    name: { type: String, unique: true },
    type: String,
    price: Number,
    rating: Number,
    discount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    imageUrl: String,
    description: String,
}, { collection: 'Stored-here' });



const Product = mongoose.model('Product', product);

module.exports = Product;
