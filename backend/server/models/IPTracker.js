const mongoose = require('mongoose');


const ipTrackerSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  commentCount: {
    type: Number,
    default: 0
  },
  lastReset: {
    type: Date,
    default: Date.now
  },
  country : {
    type: String,
    default: null
  },
  countryCode: {
    type: String,
    default: null
  },
});


module.exports = mongoose.model('IPTracker', ipTrackerSchema);