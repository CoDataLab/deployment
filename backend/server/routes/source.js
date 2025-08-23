const express = require('express');
const router = express.Router();
const Source = require("../models/Source");
const Article = require('../models/Article');
const mongoose = require("mongoose");
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

router.get("/all", async (req, res) => {
  try {
      // Check if the data is in cache
      let data = cache.get("sourceList");

      if (!data) {
          // If cache is empty, fetch data from the database
          data = await Source.find();
          if (!data.length) {
              return res.status(404).json({ message: "No Source Found" });
          }
          
          // Cache the data for 5 minutes
          cache.set("sourceList", data);
      }
      
      res.status(200).json(data);
  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
});

router.get('/get-logo-url', async (req, res) => {
    try {
        const { sourceUrl } = req.query;
        
        if (!sourceUrl) {
            return res.status(400).json({ message: 'Source URL is required.' });
        }

        const logoUrl = `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${sourceUrl}&size=256`;
        
        res.status(200).json({ logoUrl });
    } catch (error) {
        console.error('Error fetching logo URL:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

router.get("/details/:articleId", async (req, res) => {
    try {
      const { articleId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).json({ message: 'Invalid article ID.' });
      }
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({ message: 'Article not found.' });
      }
      const sourceName = article.source;
  
      if (!sourceName) {
        return res.status(404).json({ message: 'Source information is missing for this article.' });
      }
      const sourceDetails = await Source.findOne({ source: sourceName });
      if (!sourceDetails) {
        return res.status(404).json({ message: 'Source details not found.' });
      }
      const recentArticles = await Article.find({ source: sourceName })
        .sort({ date: -1 })
        .limit(5)
        .select('headline articleUrl date');  
      const result = {
        source: sourceDetails.source,
        bias: sourceDetails.mediaBias,
        relatedCountry: sourceDetails.relatedCountry,
        category: sourceDetails.category,
        type: sourceDetails.type,
        logo :sourceDetails.logoUrl,
      
        recentArticles: recentArticles.map(a => ({
          id: a._id,           
        }))
      };
  
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching article details:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
});

// Keep /:id route AFTER all specific routes
router.get("/:id", async (req, res) => {
    try {
        const sourceId = req.params.id.trim();
        const source = await Source.findById(sourceId);
        if (!source) {
            return res.status(404).json({ message: "Source not found" });
        }
        res.status(200).json(source);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get("/name/:sourceName", async (req, res) => {
    try {
        const sourceName = req.params.sourceName.trim();
        
        if (!sourceName) {
            return res.status(400).json({ message: "Source name is required" });
        }

        const source = await Source.findOne({ 
            source: { $regex: new RegExp(sourceName, 'i') } 
        });
        
        if (!source) {
            return res.status(404).json({ message: "Source not found" });
        }
        
        res.status(200).json(source);
    } catch (error) {
        console.error('Error fetching source by name:', error);
        return res.status(500).json({ message: error.message });
    }
});

router.post("/add", async (req, res) => {
    try {
        const { source, url, mediaBias, relatedCountry, type, category, language ,logoUrl} = req.body;
        if (!source || !url|| !mediaBias  || !relatedCountry || !type || !category || !language ) {
            return res.status(400).json({ message: "Source and URL are required" });
        }
        const newSource = new Source({
            source,
            url,
            mediaBias,
            relatedCountry,
            type,
            category,
            language,
            logoUrl
        });
        const savedSource = await newSource.save();
        cache.del("sourceList");

        res.status(201).json(savedSource);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

router.put("/update/:id", async (req, res) => {
    try {
        const sourceId = req.params.id.trim();
        const { source, url, mediaBias, relatedCountry, type, category, language ,logoUrl} = req.body;

        const updatedSource = await Source.findByIdAndUpdate(
            sourceId,
            { source, url, mediaBias, relatedCountry, type, category, language ,logoUrl},
            { new: true, runValidators: true }
        );

        if (!updatedSource) {
            return res.status(404).json({ message: "Source not found" });
        }

        // Update the cache after updating a source
        cache.del("sourceList");

        res.status(200).json(updatedSource);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors: errors });
        }
        return res.status(500).json({ message: error.message });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const deletedSource = await Source.findByIdAndDelete(req.params.id);
        if (!deletedSource) {
            return res.status(404).json({ message: "Source not found" });
        }
        cache.del("sourceList");

        res.status(200).json({ message: "Source deleted", deletedSource }); 
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});




module.exports = router;