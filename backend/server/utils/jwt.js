const jwt = require('jsonwebtoken');
const User = require("../models/User");


const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required ' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = await User.findById(decoded.userId); 
    if (!req.user) {
      return res.status(404).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
  }
};

module.exports = { generateToken, verifyToken ,authenticateToken};