const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const TopKeywords = require('../models/TopKeywords');
const { generatePDFFromArticles } = require('../../pdf-generator/pdfWorker');



router.get('/get-pdf', async (req, res, next) => {
    try {
        const articles = await Article.find({
            headline: { $ne: null },
            source: { $ne: null },
            label: { $lt: -0.4 },
            date: { $ne: null },
            imageUrl: { $ne: null }
        }).sort({ createdAt: -1 }).limit(5);

        const latestTopKeywords = await TopKeywords.findOne()
        .sort({ createdAt: -1 }) 
        .exec();

        if (!latestTopKeywords) {
            return res.status(404).json({ message: 'No top keywords found' });
        }

        if (articles.length === 0) {
            return res.status(404).json({ message: 'No articles found with all fields populated.' });
        }

        const pdfBuffer = await generatePDFFromArticles(articles, latestTopKeywords);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline; filename="output.pdf"',
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error retrieving articles for PDF:', error.message);
        next(error);
    }
});

module.exports = router;