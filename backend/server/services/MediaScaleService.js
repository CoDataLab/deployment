const { SCORING_CONFIG } = require('../configs/constants');
const Article = require('../models/Article');
const Source = require('../models/Source');
const MediaScaleIndex = require('../models/MediaScaleIndex');

class MediaScaleService {

  cleanBias(bias) {
    return (typeof bias === 'string') ? bias.toLowerCase().trim() : 'unknown';
  }

  async calculateScoresByCategory(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const category = req.params.category;

    if (!category) {
      return res.status(400).json({ success: false, message: 'Category param is required' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate query params are required' });
    }

    const startTimestamp = Number(startDate);
    const endTimestamp = Number(endDate);

    // Fetch articles and sources
    const [articles, sources] = await Promise.all([
      Article.find({
        date: {
          $gte: startTimestamp,
          $lte: endTimestamp,
        }
      }),
      Source.find({ category })
    ]);

    // Step 1: Build source metrics by source name (string)
    const sourceMetrics = {};
    for (const article of articles) {
      const src = article.source?.toString();
      if (!src) continue;

      if (!sourceMetrics[src]) {
        sourceMetrics[src] = { articleCount: 0, sentimentCount: 0, totalSentiment: 0 };
      }

      sourceMetrics[src].articleCount += 1;

      if (article.label !== null && article.label !== undefined && article.label !== 0) {
        sourceMetrics[src].sentimentCount += 1;
        sourceMetrics[src].totalSentiment += article.label;
      }
    }

    // Step 2: Compute max articles for normalization
    const maxArticles = Math.max(1, ...Object.values(sourceMetrics).map(m => m.articleCount));

    // Step 3: Compute score for each source
    const results = [];

    for (const source of sources) {
      const srcName = source.source;
      const metrics = sourceMetrics[srcName] || {
        articleCount: 0,
        sentimentCount: 0,
        totalSentiment: 0,
      };

      const s_rate = (metrics.articleCount / maxArticles) * 10;
      console.log(`Source: ${srcName}, Articles: ${metrics.articleCount}, Rate Score: ${s_rate}`);

      // Neutrality Score
      let s_neutrality = SCORING_CONFIG.NON_ENGLISH_NEUTRALITY_SCORE;
      const isEnglish = (source.language || '').toLowerCase() === 'english';
      if (isEnglish) {
        if (metrics.sentimentCount > 0) {
          const avgSentiment = metrics.totalSentiment / metrics.sentimentCount;
          s_neutrality = (1 - Math.abs(avgSentiment)) * 10;
        } else {
          s_neutrality = 10;
        }
      }

      // Bias Score
      const cleanedBias = this.cleanBias(source.mediaBias);
      const biasValue = SCORING_CONFIG.BIAS_MAP[cleanedBias] ?? SCORING_CONFIG.MAX_BIAS_VALUE;
      const s_bias = (1 - (biasValue / SCORING_CONFIG.MAX_BIAS_VALUE)) * 10;

      // Other attribute scores
      const langKey = (source.language || 'other').toLowerCase();
      const catKey = (source.category || 'unknown').toLowerCase();
      const typeKey = (source.type || 'unknown').toLowerCase();

      const s_language = SCORING_CONFIG.LANGUAGE_SCORES[langKey] ?? SCORING_CONFIG.LANGUAGE_SCORES.other;
      const s_category = SCORING_CONFIG.CATEGORY_SCORES[catKey] ?? SCORING_CONFIG.CATEGORY_SCORES.unknown;
      const s_type = SCORING_CONFIG.SOURCE_TYPE_SCORES[typeKey] ?? SCORING_CONFIG.SOURCE_TYPE_SCORES.unknown;

      const finalScore =
        (SCORING_CONFIG.WEIGHTS.rate * s_rate) +
        (SCORING_CONFIG.WEIGHTS.neutrality * s_neutrality) +
        (SCORING_CONFIG.WEIGHTS.bias * s_bias) +
        (SCORING_CONFIG.WEIGHTS.language * s_language) +
        (SCORING_CONFIG.WEIGHTS.category * s_category) +
        (SCORING_CONFIG.WEIGHTS.type * s_type);

      results.push({
        source: source._id,
        source_name: srcName,
        overall_score: finalScore,
        neutrality_score: s_neutrality,
        bias_score: s_bias,
        type_score: s_type,
        rate_score: s_rate,
        category_score: s_category,
        language_score: s_language,
      });
    }

    // Step 4: Sort, rank, save to DB
    results.sort((a, b) => b.overall_score - a.overall_score);
    results.forEach((r, idx) => r.rank = idx + 1);

    const mediaScaleDoc = new MediaScaleIndex({
      results,
      startDate: startTimestamp,
      endDate: endTimestamp,
      category,
    });

    await mediaScaleDoc.save();
    console.log(`✅ MediaScaleIndex saved successfully with ${results.length} entries.`);

    return res.json({ success: true, results });

  } catch (error) {
    console.error('❌ Error calculating scores:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}


  async getByCategory(req, res) {
    try {
      const category = req.params.category;
      if (!category) {
        return res.status(400).json({ success: false, message: 'Category param is required' });
      }

      const limit = parseInt(req.query.limit, 10) || 10;

      const scales = await MediaScaleIndex.find({ category })
        .sort({ date: -1 })
        .limit(limit);

      return res.json({ success: true, scales });
    } catch (error) {
      console.error('❌ Error fetching by category:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getLatest(req, res) {
    try {
      const limit = parseInt(req.query.limit, 10) || 5;

      const scales = await MediaScaleIndex.find()
        .sort({ date: -1 })
        .limit(limit);

      return res.json({ success: true, scales });
    } catch (error) {
      console.error('❌ Error fetching latest scales:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
 async deleteById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID param is required' });
      }
      
      const deletedScale = await MediaScaleIndex.findByIdAndDelete(id);
      if (!deletedScale) {
        return res.status(404).json({ success: false, message: 'MediaScale not found' });
      }
      
      return res.json({ 
        success: true, 
        message: 'MediaScale deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting MediaScale:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  async getSourceRanking(req, res) {
  try {
    const { category, sourceId } = req.params;

    if (!category || !sourceId) {
      return res.status(400).json({
        success: false,
        message: 'Both category and sourceId parameters are required',
      });
    }
    const latestScale = await MediaScaleIndex.findOne({ category })
      .sort({ endDate: -1 })
      .lean();

    if (!latestScale) {
      return res.status(404).json({
        success: false,
        message: 'No MediaScaleIndex found for this category',
      });
    }

    // Find the ranking info for the source
    const sourceResult = latestScale.results.find(
      (entry) => entry.source.toString() === sourceId
    );

    if (!sourceResult) {
      return res.status(404).json({
        success: false,
        message: 'Source not found in the latest ranking for this category',
      });
    }

    return res.json({
      success: true,
      result: sourceResult,
    });
  } catch (error) {
    console.error('❌ Error fetching source ranking:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


}

module.exports = MediaScaleService;
