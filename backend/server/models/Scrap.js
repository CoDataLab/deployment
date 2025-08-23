const mongoose = require('mongoose');

const ScrapSchema = new mongoose.Schema({
  source: { type: mongoose.Schema.Types.Mixed },
  title: { type: mongoose.Schema.Types.Mixed },
  link: { type: mongoose.Schema.Types.Mixed }, // Can be a string or an array of strings
  pubDate: { type: Date },
  description: { type: String },
  imageUrl:{ type: mongoose.Schema.Types.Mixed },
  creator: { type: mongoose.Schema.Types.Mixed },
  date: { type: Date },
  credit:{ type: mongoose.Schema.Types.Mixed },
  author: { type: mongoose.Schema.Types.Mixed },
  publisher: { type: mongoose.Schema.Types.Mixed },
  address: { type: mongoose.Schema.Types.Mixed },
  image: { type: String },
}, { timestamps: true }); // This adds createdAt and updatedAt fields

const Scrap = mongoose.model('Scrap', ScrapSchema);

module.exports = Scrap;