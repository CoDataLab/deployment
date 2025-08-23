const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const Article = require('../models/Article');
const TopKeywords = require('../models/TopKeywords');
const extractTopKeywords = require('../utils/reportingAnalyzer');

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

router.get('/top-keywords', async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const startDate = Number(start);
        const endDate = Number(end);

        if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
            return res.status(400).json({ error: 'Invalid date range' });
        }

        const cacheKey = `topKeywords_${startDate}_${endDate}`;

        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            console.log('Cache hit');
            return res.json(cachedData);
        }

        console.log('Cache miss');
        const articles = await Article.find({
            date: { $gte: startDate, $lte: endDate }
        });

        const sortedKeywords = extractTopKeywords(articles);

        const topKeywordsDoc = new TopKeywords({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            topKeywords: sortedKeywords,
        });

        await topKeywordsDoc.save();
        cache.set(cacheKey, sortedKeywords);

        res.json(sortedKeywords);
    } catch (error) {
        console.error('Error retrieving top keywords:', error.message);
        next(error);
    }
});

router.get('/latest-top-keywords', async (req, res, next) => {
    try {
        const latestTopKeywords = await TopKeywords.findOne()
            .sort({ createdAt: -1 }) 
            .exec();

        if (!latestTopKeywords) {
            return res.status(404).json({ message: 'No top keywords found' });
        }

        res.json(latestTopKeywords);
    } catch (error) {
        console.error('Error retrieving latest top keywords:', error.message);
        next(error);
    }
});

router.get('/articles-by-keyword', async (req, res, next) => {
    try {
        const { keyword, start, end } = req.query;
        const startDate = Number(start);
        const endDate = Number(end);

        if (!keyword || isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        console.log(`Fetching articles for keyword: ${keyword}`);

        let articles = [];

        if (keyword.includes(' ')) {
            const [word1, word2] = keyword.split(' ');

            // Execute two separate queries
            const articles1 = await Article.find({
                date: { $gte: startDate, $lte: endDate },
                keywords: { $regex: word1, $options: 'i' }
            }).sort({ date: -1 });

            const articles2 = await Article.find({
                date: { $gte: startDate, $lte: endDate },
                keywords: { $regex: word2, $options: 'i' }
            }).sort({ date: -1 });

            // Merge and remove duplicates
            const uniqueArticles = new Map();
            [...articles1, ...articles2].forEach(article => {
                uniqueArticles.set(article._id.toString(), article);
            });

            articles = Array.from(uniqueArticles.values());
        } else {
            // Single keyword query
            articles = await Article.find({
                date: { $gte: startDate, $lte: endDate },
                keywords: { $regex: keyword, $options: 'i' }
            }).sort({ date: -1 });
        }

        if (articles.length === 0) {
            return res.status(404).json({ message: 'No articles found for the given keyword and date range' });
        }

        res.json(articles);
    } catch (error) {
        console.error('Error retrieving articles by keyword:', error.message);
        next(error);
    }
});

router.get('/tension', async (req, res, next) => {
    try {
        const { start, end } = req.query;
        const startDate = Number(start);
        const endDate = Number(end);

        if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
            return res.status(400).json({ error: 'Invalid date range' });
        }

        const articles = await Article.find({
            date: { $gte: startDate, $lte: endDate }
        });

        if (articles.length === 0) {
            return res.status(404).json({ message: 'No articles found in the given date range' });
        }

        const totalLabel = articles.reduce((sum, article) => sum + article.label, 0);
        const averageLabel = totalLabel / articles.length;

        res.json({ averageLabel });
    } catch (error) {
        console.error('Error calculating average label:', error.message);
        next(error);
    }
});

module.exports = router;
