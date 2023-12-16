// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// Create a new product
router.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all products
router.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Other CRUD routes (update, delete) can be added similarly

module.exports = router;
