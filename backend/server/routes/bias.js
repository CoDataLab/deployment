const express = require('express');
const router = express.Router();
const { fetchArticleBiasDistribution } = require("../utils/biasUtils");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 1800 });

router.get('/article-bias-distribution', async (req, res) => {
    try {
        const cacheKey = "article-bias-distribution";
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            return res.json(cachedData);
        }

        const endDate = Date.now(); // Current timestamp in milliseconds
        const startDate = endDate - 24 * 60 * 60 * 1000; // 24 hours ago

        const distribution = await fetchArticleBiasDistribution(startDate, endDate);
        if (!distribution) return res.status(404).json({ message: "No Articles Found" });

        const response = { distribution };
        cache.set(cacheKey, response); // Cache the response for 30 minutes

        res.json(response);
    } catch (err) {
        console.error("Failed to fetch article bias distribution:", err);
        res.status(500).json({ error: "Failed to fetch article bias distribution" });
    }
});


module.exports = router;