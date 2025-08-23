// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function isAuthenticated(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  const authorizeRole = (role) => {
    return (req, res, next) => {
      // Ensure that the user is attached to the req (e.g., from the authenticateToken middleware)
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      // Check if the user role matches the required role
      if (req.user.role !== role) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }
      next();
    };
  };

module.exports = {isAuthenticated,authorizeRole};