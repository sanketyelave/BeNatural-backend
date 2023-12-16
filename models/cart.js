// models/cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    usersName: { type: String }, // Fix the type to String
    quantitySelected: { type: Number, default: 16 },
    name: { type: String, unique: true },
    type: String,
    price: Number,
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to the Product model
        required: true,
    },
    imageUrl: String,
}, { collection: 'carts' });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
