const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken, verifyToken ,authenticateToken} = require('../utils/jwt');



router.post('/register', async (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!email || !password) {
    return next({ message: 'Email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next({ message: 'User already exists', status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role: role || "user", 
    });

    await newUser.save();
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(404).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.status(200).json({ message: 'Login successful', token,user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      email: req.user.email,
    });
  } catch (error) {
    console.error("Error retrieving user details:", error); // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;