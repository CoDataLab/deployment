const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxLength: 500
  },
  author: {
    type: String,
    required: true,
    maxLength: 50
  },
  articleId: {
    type: String,
    required: true,
    index: true // Add an index for faster lookups
  },
  ipAddress: {
    type: String,
    required: true,
    select: false // Hide from default queries for privacy
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Comment', commentSchema);