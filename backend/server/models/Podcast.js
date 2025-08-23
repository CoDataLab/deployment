const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Podcast title is required.'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required.'],
      trim: true,
    },
    audioUrl: {
      type: String,
      required: [true, 'An audio URL is required.'],
    },
    coverArtUrl: {
      type: String,
      required: [true, 'A cover art URL is required.'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Podcast', podcastSchema);

