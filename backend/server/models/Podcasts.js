const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  headline: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  articleUrl: {
    type: String,
    required: true,
  },
  audioUrl: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;
