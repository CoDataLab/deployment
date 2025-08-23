const express = require('express');
const router = express.Router();
const { gatherPdfs } = require('../utils/pdfGatherer');

router.get('/search', async (req, res, next) => {
    try {
        const query = req.query.q;
        const maxResults = parseInt(req.query.maxResults) || 8;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }
        const results = await gatherPdfs(query, maxResults);
        if(!results || results.length === 0) return res.status(404).json({message:"No PDFs Found"});
        res.json(results);
    } catch (error) {
        console.error('Error retrieving articles for PDF:', error.message);
        next(error);
    }
});

module.exports = router;
