const express = require('express');
const router = express.Router();
const Article = require("../models/Article");
const Source = require("../models/Source");

const mongoose = require('mongoose') ;
const NodeCache = require('node-cache');
const { getLatestHotKeyword,getLatestKeywords } = require('../utils/biasUtils') ;
const { getTotalArticlesCount  ,getTotalArticlesCountBySource} = require('../utils/analyzer') ;

const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

router.get("/read/:id", async (req, res) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid article ID format." });
    }

    try {
        // Find and increment view count atomically
        const article = await Article.findByIdAndUpdate(
            id,
            { 
                $inc: { viewCount: 1 },
                $set: { lastViewed: new Date() }
            },
            { new: true } // Return updated document
        );

        if (!article) {
            return res.status(404).json({ message: "Article not found." });
        }

        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/all", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sourceParam = req.query.source; 
        
        // Calculate timestamp 2 days ago (in milliseconds)
        const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
        
        const query = {
            ...(sourceParam ? { source: new RegExp(sourceParam, 'i') } : {}),
            imageUrl: { $ne: null },
            date: { $gte: twoDaysAgo }  // Only articles from past 2 days
        };
        
        // Sort by label ascending (1) or descending (-1)
        const articles = await Article.find(query)
            .sort({ label: 1 }) 
            .limit(limit);
            
        if (!articles.length) 
            return res.status(404).json({ message: "No Articles Found" });
            
        const totalArticles = await Article.countDocuments(query);
        
        res.status(200).json({
            totalArticles,
            articles,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
router.delete('/clean-duplicates', async (req, res, next) => {
    const { startDate, endDate } = req.query; // Expecting timestamps in query parameters

    // Validate the dates
    if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required." });
    }

    try {
        const start = new Date(parseInt(startDate, 10));
        const end = new Date(parseInt(endDate, 10)); 

        const filteredArticles = await Article.find({
            date: { $gte: start, $lte: end }
        });

        const duplicates = await Article.aggregate([
            {
                $match: {
                    _id: { $in: filteredArticles.map(article => article._id) } 
                }
            },
            {
                $group: {
                    _id: {
                        headline: "$headline",
                        description: "$description"
                    },
                    uniqueIds: { $addToSet: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 } 
                }
            }
        ], { allowDiskUse: true });

        const idsToDelete = duplicates.flatMap(group => group.uniqueIds.slice(1)); 
        const result = await Article.deleteMany({ _id: { $in: idsToDelete } });

        res.json({
            message: "Duplicate articles cleaned successfully.",
            duplicatesFound: duplicates.length,
            duplicatesDeleted: result.deletedCount,
            startDate: start.toISOString(),
            endDate: end.toISOString()
        });
    } catch (error) {
        console.error("Error cleaning duplicates:", error);
        next(error);
    }
});
router.delete("/delete", async (req, res) => {
    const limit = parseInt(req.query.limit);

    if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ message: "Invalid limit provided." });
    }

    try {
        const documentsToDelete = await Article.find().limit(limit);

        if (documentsToDelete.length === 0) {
            return res.status(404).json({ message: "No documents to delete." });
        }
        const result = await Article.deleteMany({ _id: { $in: documentsToDelete.map(doc => doc._id) } });
        return res.status(200).json({ message: `${result.deletedCount} documents deleted.` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
router.get("/main-headline", async (req, res) => {
    try {
        const timestamp = Date.now();
        const cacheKey = `main_headline_${timestamp}`;
        const cachedResult = cache.get(cacheKey);
      
        if (cachedResult) {
            return res.status(200).json(cachedResult);
        }

        const term = await getLatestHotKeyword();
        const limit = parseFloat(req.query.limit);

        const article = await Article.findOne({
            imageUrl: { $ne: null },
            label: { $lte: limit },
            description: { $exists: true, $ne: null },
            headline: { $regex: term, $options: 'i' },
        }).sort({ createdAt: -1 });

        if (!article) {
            return res.status(404).json({ message: "No article found matching the criteria." });
        }

        cache.set(cacheKey, article);

        res.status(200).json(article);
    } catch (error) {
        console.error("Error fetching main headline:", error);
        res.status(500).json({ message: error.message });
    }
});
router.get("/articles-different-bias", async (req, res) => {
    try {
        const term = await getLatestHotKeyword();

        if (!term) {
            return res.status(400).json({ message: "No hot keyword available" });
        }

        const articles = await Article.aggregate([
            {
                $match: {
                    imageUrl: { $ne: null },
                    description: { $exists: true, $ne: null },
                    keywords: { $regex: term.trim(), $options: 'i' }
                }
            },
            {
                $lookup: {
                    from: "sources",
                    localField: "source",
                    foreignField: "source",
                    as: "sourceInfo"
                }
            },
            { $unwind: "$sourceInfo" },
            {
                $match: {
                    "sourceInfo.mediaBias": {
                        $in: ["left", "center", "right", "lean left", "lean right"]
                    }
                }
            },
            {
                $sort: { date: -1 } // Sort articles by date (newest first)
            },
            {
                $addFields: {
                    simplifiedBias: {
                        $switch: {
                            branches: [
                                { case: { $in: ["$sourceInfo.mediaBias", ["left", "lean left"]] }, then: "left" },
                                { case: { $in: ["$sourceInfo.mediaBias", ["right", "lean right"]] }, then: "right" }
                            ],
                            default: "$sourceInfo.mediaBias"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$simplifiedBias",
                    articles: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    article: { $arrayElemAt: ["$articles", 0] } // Pick the first (latest) article from each group
                }
            },
            {
                $addFields: {
                    biasOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", "left"] }, then: 1 },
                                { case: { $eq: ["$_id", "center"] }, then: 2 },
                                { case: { $eq: ["$_id", "right"] }, then: 3 }
                            ],
                            default: 4
                        }
                    }
                }
            },
            {
                $sort: { biasOrder: 1 } // Sort by custom bias order
            },
            { $limit: 3 }
        ]);

        if (!articles.length) {
            return res.status(404).json({ message: "No articles found matching the criteria." });
        }

        res.status(200).json(articles.map(a => a.article));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
router.get("/source-publishing-rate", async (req, res) => {
    try {
        const sourceParam = req.query.source;
        if (!sourceParam) {
            return res.status(400).json({ message: "Source parameter is required." });
        }

        const cacheKey = `source-publishing-rate:${sourceParam}`;
        
       
        const cachedResult = cache.get(cacheKey);
        if (cachedResult) {
            return res.status(200).json(cachedResult);
        }

        const sourceRegex = new RegExp(sourceParam, 'i');
        const articles = await Article.find({ source: sourceRegex }).sort({ date: -1 });

        if (!articles || articles.length === 0) {
            return res.status(404).json({ message: "No articles found for the given source." });
        }

        const today = new Date();
        const dailyCounts = {};

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const count = articles.filter(article => {
                const articleDate = new Date(article.date);
                return articleDate >= date && articleDate < nextDay;
            }).length;

            dailyCounts[date.getTime()] = count;
        }

        cache.set(cacheKey, dailyCounts);

        res.status(200).json(dailyCounts);
    } catch (error) {
        console.error("Error fetching source publishing rate:", error);
        res.status(500).json({ message: error.message });
    }
});
router.get("/search", async (req, res) => {
    try {
        const { source, relatedCountry, mediaBias, category, type, limit = 10 } = req.query;

        let filter = {};

        if (source) {
            filter.source = source;
        }

        if (relatedCountry || mediaBias || category || type) {
            let sourceFilter = {};

            if (relatedCountry) sourceFilter.relatedCountry = relatedCountry;
            if (mediaBias) sourceFilter.mediaBias = mediaBias;
            if (category) sourceFilter.category = category;
            if (type) sourceFilter.type = type;

            const matchingSources = await Source.find(sourceFilter).select("source");
            const sourceNames = matchingSources.map(src => src.source);

            if (sourceNames.length > 0) {
                filter.source = { $in: sourceNames };
            }
        }

        const articles = await Article.find(filter).limit(Number(limit)).sort({date :-1});

        res.json({ count: articles.length, articles });
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ message: error.message });
    }
});
router.get('/count/:days', async (req, res) => {
    try {
        const days = parseInt(req.params.days, 10);

        if (isNaN(days) || days < 1) {
            return res.status(400).json({ error: 'Invalid days parameter. Must be a positive integer.' });
        }

        // Check cache for total count
        let totalArticlesCount = cache.get('totalCount');
        if (totalArticlesCount === undefined) {
            totalArticlesCount = await Article.countDocuments();
            cache.set('totalCount', totalArticlesCount);
        }

        let counts = cache.get(`count-${days}`);
        if (counts === undefined) {
            counts = await getTotalArticlesCount(days);
            cache.set(`count-${days}`, counts);
        }

        res.status(200).json({
            days,
            totalCount: totalArticlesCount,
            count: counts.totalCount,
            distinctSourceCount: counts.distinctSourceCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});



router.get('/count-by-source', async (req, res) => {
    try {
        const source = req.query.source?.trim();

        if (!source) {
            return res.status(400).json({ error: 'Source parameter is required.' });
        }

        const count = await getTotalArticlesCountBySource(source);
        
        if (count === 0) {
            return res.status(404).json({ error: 'No articles found for the specified source.' });
        }

        res.status(200).json({
            source,
            count
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

router.get("/different-sources-articles", async (req, res) => {
    try {
        const term = await getLatestKeywords();
        const article = await Article.find({
            keywords: { $regex: term, $options: "i" },
            imageUrl: { $ne: null } 
        }).sort({date:-1}).limit(4);

        if (!article || article.length === 0) {
            return res.status(404).json({ message: "No article found matching the criteria." });
        }

        res.status(200).json(article);
    } catch (error) {
        console.error("Error fetching main headline:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get("/get-hot-headlines", async (req, res) => {
    try {
        const articles = await Article.find({
            imageUrl: null,
            label: { $lt: -0.25 }
        })
        .select('source articleUrl headline') // Specify the fields to return
        .sort({ date: -1 })
        .limit(7);

        if (!articles.length) {
            return res.status(404).json({ message: "No Articles Found" });
        }

        res.status(200).json({
            articles
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
module.exports = router;
