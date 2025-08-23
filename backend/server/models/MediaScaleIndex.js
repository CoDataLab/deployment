const mongoose = require('mongoose');

const ScoreEntrySchema = new mongoose.Schema({
  source: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source',
    required: true
  },
  source_name: String,
  overall_score: Number,
  neutrality_score: Number,
  bias_score: Number,
  type_score: Number,
  rate_score: Number,
  category_score: Number,
  language_score: Number,
  rank: Number
});

const MediaScaleIndex = new mongoose.Schema({
  results: [ScoreEntrySchema],
  startDate: Date,
  endDate: Date,
  category: {
    type: String,
    enum: [
      'Politics', 
      'Technology', 
      'Sports', 
      'Health', 
      'Business', 
      'Entertainment', 
      'Science', 
      'World', 
      'Animals', 
      'Cryptocurrencies', 
      'Culture', 
      'Education', 
      'Environment', 
      'Lifestyle', 
      'Gaming'
    ],
    default: 'Unknown'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MediaScaleIndex', MediaScaleIndex);
