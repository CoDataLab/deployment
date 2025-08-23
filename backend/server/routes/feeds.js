const express = require('express');
const router = express.Router();

const Source = require('../models/Source');
const Scrap = require('../models/Scrap');
const Article = require('../models/Article');
const ScrapeHistory = require('../models/ScrapeHistory')
const SourceGroup = require("../models/SourceGroup") ;

const { normalizeData } = require('../utils/transformer');
const { fetchAllFeeds } = require('../utils/fetchRSS');


router.get('/scrape', async (req, res, next) => {
    try {
        const startTime = Date.now(); // Start timing

        const limit = parseInt(req.query.limit);
        const offset = parseInt(req.query.offset) || 0;
        const groupId = req.query.groupId; // Get the source group ID from the query

        if (!groupId) {
            return res.status(400).json({
                message: 'Source group ID is required.'
            });
        }

        if (isNaN(limit) || limit <= 0) {
            return res.status(400).json({
                message: 'Limit is required and must be a positive integer.'
            });
        }

        // Retrieve the source group and its sources
        const sourceGroup = await SourceGroup.findById(groupId).populate('sourceIds');
        if (!sourceGroup) {
            return res.status(404).json({
                message: 'Source group not found.'
            });
        }

        const sources = sourceGroup.sourceIds.slice(offset, offset + limit);
        const totalSources = sourceGroup.sourceIds.length;

        let completedSources = 0;
        let totalScrapedItems = 0;
        const scrapedItems = [];

        for (const source of sources) {
            try {
                const fetchedData = await fetchAllFeeds([source]);
                scrapedItems.push(...fetchedData);
                totalScrapedItems += fetchedData.length;
                completedSources++;
            } catch (scrapeError) {
                console.error(`Error scraping ${source.source}:`, scrapeError.message);
            }
        }

        const timeElapsed = (Date.now() - startTime) / 1000;

        // Create and save scrape history here
        const scrapeHistory = new ScrapeHistory({
            scrapeTime: new Date(),
            length: totalScrapedItems,
            waitTime: timeElapsed,
            totalSources: totalSources,
            name:sourceGroup.name,
        });

        try {
            await scrapeHistory.save();
            console.log(`Scrape history saved`);
        } catch (error) {
            console.error(`Error saving scrape history: ${error.message}`);
        }

        res.json({
            totalSources,
            completedSources,
            totalScrapedItems,
            timeElapsedSeconds: timeElapsed,
            data: scrapedItems,
        });
    } catch (error) {
        console.error('Overall scraping error:', error.message);
        next(error);
    }
});
router.post('/saveData', async (req, res, next) => {
        try {
            const data = req.body;

            const savedData = await Scrap.insertMany(data);

            res.json({
                message: 'Data saved successfully.',
                savedCount: savedData.length,
                data: savedData,
            });
        } catch (error) {
            console.error('Error saving data:', error);
            next(error);
        }
    });       
    
router.get('/getLatestScrap', async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit, 10) || 10;

            const scraps = await Scrap.find()
                .sort({ createdAt: -1 })
                .limit(limit);

            res.status(200).json({
                message: 'Latest scraped data retrieved successfully.',
                count: scraps.length,
                data: scraps,
            });
        } catch (error) {
            console.error('Error fetching latest scraped data:', error);
            next(error);
        }
});

router.post('/normalizeData', async (req, res, next) => {
        try {
            const data = req.body;

            const normalizedData = await normalizeData(JSON.stringify(data));

            res.json({
                message: 'Data normalized successfully.',
                normalizedCount: normalizedData.length,
                data: normalizedData,
            });
        } catch (error) {
            console.error('Error normalizing data:', error);
            next(error);
        }
    });

router.post('/save-clean-data', async (req, res, next) => {
        try {
            const data = req.body;

            const savedData = await Article.insertMany(data);

            res.json({
                message: 'Data saved successfully.',
                savedCount: savedData.length,
                data: savedData,
            });
        } catch (error) {
            console.error('Error saving data:', error);
            next(error);
        }
   });



module.exports = router;