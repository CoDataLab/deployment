const express = require('express');
const router = express.Router();

const Article = require('../models/Article');
const Tension = require('../models/Tension');



router.post('/save', async (req, res, next) => {
    try {
        const { start, end } = req.body; 
        const startDate = Number(start);
        const endDate = Number(end);
        
        if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
            return res.status(400).json({ error: 'Invalid date range' });
        }

        // Find articles in the date range with label not equal to 0
        const articles = await Article.find({
            date: { $gte: startDate, $lte: endDate },
            label: { $ne: 0 } // Ignore articles with label 0
        });
        
        if (articles.length === 0) {
            return res.status(404).json({ message: 'No articles found in the given date range' });
        }
        
        const totalLabel = articles.reduce((sum, article) => sum + article.label, 0);
        const averageLabel = totalLabel / articles.length;

        const existingTension = await Tension.findOne({
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });

        if (existingTension) {
            return res.status(409).json({ message: 'Tension with the same start and end dates already exists' });
        }

        const tension = new Tension({
            value: averageLabel, 
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        });
        
        await tension.save();
        res.json({ average: averageLabel });
    } catch (error) {
        console.error('Error calculating average label:', error.message);
        next(error);
    }
});

router.get('/all', async (req, res, next) => {
    try {
        const tensions = await Tension.find().sort({ endDate: -1 }).limit(350);
        res.json(tensions);
    } catch (error) {
        console.error('Error fetching tensions:', error.message);
        next(error);
    }
});
module.exports = router;