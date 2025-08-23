const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  tweet: {
    type: String,
    required: true
  },
  tweetUrl: {
    type: String,
    required: true,
    unique: true
  },
  account: {
    type: String,
    required: true
  },
  label: {
    type: Number,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tweet', tweetSchema);
