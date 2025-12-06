const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../models/Admin');
const Product = require('../models/Product');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Simple admin register endpoint (for initial setup)
router.post('/register', async (req,res)=>{
  const { username, password } = req.body;
  if(!username || !password) return res.status(400).json({message:'username & password required'});
  const existing = await Admin.findOne({username});
  if(existing) return res.status(400).json({message:'admin exists'});
  const hash = await bcrypt.hash(password, 10);
  const admin = new Admin({ username, passwordHash: hash });
  await admin.save();
  res.json({message:'admin created'});
});

// POST /api/admin/login
router.post('/login', async (req,res)=>{
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if(!admin) return res.status(401).json({message:'Invalid creds'});
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if(!ok) return res.status(401).json({message:'Invalid creds'});
  const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Protected helper
const verify = (req,res,next)=>{
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({message:'no token'});
  const token = auth.split(' ')[1];
  try{
    const data = jwt.verify(token, JWT_SECRET);
    req.admin = data;
    next();
  }catch(e){
    return res.status(401).json({message:'invalid token'});
  }
};

// POST /api/admin/add-product
router.post('/add-product', verify, async (req,res)=>{
  const { name, description, price, image } = req.body;
  if(!name || !price) return res.status(400).json({message:'name & price required'});
  const p = new Product({ name, description, price, image });
  await p.save();
  res.json({message:'product added', product: p});
});

// GET /api/admin/products
router.get('/products', verify, async (req,res)=>{
  const products = await Product.find().sort({createdAt:-1});
  res.json(products);
});

module.exports = router;
