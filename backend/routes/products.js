const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth'); // <-- correct CommonJS import

// public GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (err) {
    console.error('GET /api/products error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    return res.json(p);
  } catch (err) {
    console.error('GET /api/products/:id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes (example: update & delete)
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(updated);
  } catch (err) {
    console.error('PUT /api/products/:id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /api/products/:id error', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
