const express = require('express');
const ScrapeHistory = require('../models/ScrapeHistory'); 
const router = express.Router();

router.get('/all', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10; 
    const page = parseInt(req.query.page) || 1; 

    try {
        const scrapeHistories = await ScrapeHistory.find()
            .sort({ scrapeTime: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalCount = await ScrapeHistory.countDocuments(); 

        res.json({
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            data: scrapeHistories,
        });
    } catch (error) {
        console.error(`Error fetching scrape history: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;