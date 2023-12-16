const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,

        trim: true,
    },
    image: {
        type: String, // Assuming you store the image URL as a string

    },
    price: {
        type: Number,

    },

    quantity: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },

},
    {
        timestamps: true,
    }
);

const ProductListing = mongoose.model('ProductListing', ProductSchema);

module.exports = ProductListing;
