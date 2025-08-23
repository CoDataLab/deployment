const express = require('express');
const router = express.Router();
const Source = require('../models/Source');
const Article = require('../models/Article');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 1800 });

router.get('/article/:country', async (req, res) => {
    try {
        const country = req.params.country.trim();
        const limit = parseInt(req.query.limit) || 10;

        if (!country) {
            return res.status(400).json({ error: 'Country parameter is required.' });
        }

        // Find all sources related to the given country (case-insensitive)
        const sources = await Source.find({ 
            relatedCountry: { $regex: `^${country}$`, $options: 'i' } 
        }).select('source');

        if (!sources.length) {
            return res.status(404).json({ message: `No sources found for country: ${country}` });
        }

        const sourceRegexQueries = sources.map(source => ({
            source: { $regex: `^${source.source}$`, $options: 'i' }
        }));

        // Fetch articles that match the sources using regex (case-insensitive)
        const articles = await Article.find({ $or: sourceRegexQueries })
            .limit(limit)
            .sort({ date: -1 });

        if (!articles.length) {
            return res.status(404).json({ message: `No articles found for country: ${country}` });
        }

        res.status(200).json(articles);
    } catch (err) {
        console.error('Error fetching articles:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/countries-sources', async (req, res) => {
    try {
        const countriesWithCounts = await Source.aggregate([
            {
                $group: {
                    _id: "$relatedCountry", 
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    country: "$_id", 
                    count: 1,
                    _id: 0 
                }
            },
            {
                $sort: { country: 1 } 
            }
        ]);
        if (!countriesWithCounts.length) {
            return res.status(404).json({ message: "No countries with sources found." });
        }
        res.status(200).json(countriesWithCounts);
    } catch (error) {
        console.error('Error fetching distinct countries with counts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/distinct-countries', async (req, res) => {
    try {
        const cachedCountries = cache.get("distinctCountries");

        if (cachedCountries) {
            return res.status(200).json(cachedCountries); // Return cached data if available
        }

        const distinctCountries = await Source.distinct('relatedCountry');

        if (!distinctCountries.length) {
            return res.status(404).json({ message: "No distinct countries found." });
        }

        cache.set("distinctCountries", distinctCountries);

        res.status(200).json(distinctCountries);
    } catch (err) {
        console.error('Error fetching distinct countries:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/distinct-categories', async (req, res) => {
    try {
        const cachedCategories = cache.get("distinctCategories");

        if (cachedCategories) {
            return res.status(200).json(cachedCategories); // Return cached data if available
        }

        const distinctCategories = await Source.distinct('category'); // Fetch distinct categories from Source

        if (!distinctCategories.length) {
            return res.status(404).json({ message: "No distinct categories found." });
        }

        cache.set("distinctCategories", distinctCategories);

        res.status(200).json(distinctCategories);
    } catch (err) {
        console.error('Error fetching distinct categories:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
