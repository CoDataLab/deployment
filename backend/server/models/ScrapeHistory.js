const mongoose = require('mongoose');

const scrapeHistorySchema = new mongoose.Schema({
    scrapeTime: { type: Date, required: true },
    length: { type: Number, required: true },
    waitTime: { type: Number, required: true },
    totalSources: { type: Number, required: true },
    name: { type: String, required: true },
});

const ScrapeHistory = mongoose.model('ScrapeHistory', scrapeHistorySchema);

module.exports = ScrapeHistory;