const mongoose = require('mongoose');

const topKeywordsSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true, 
    },
    endDate: {
      type: Date,
      required: true, 
    },
    topKeywords: [
      {
        keyword: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const TopKeywords = mongoose.model('TopKeywords', topKeywordsSchema);

module.exports = TopKeywords;
