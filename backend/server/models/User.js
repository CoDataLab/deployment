const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user','admin', 'superadmin','owner'], 
    default: 'admin', 
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;