const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    headline: { type: mongoose.Schema.Types.Mixed, default: null },
    articleUrl: { type: mongoose.Schema.Types.Mixed, default: null },
    description: { type: mongoose.Schema.Types.Mixed, default: null },
    date: { type: Number, default: null },
    imageUrl: { type: mongoose.Schema.Types.Mixed, default: null },
    source: { type: String, default: null },
    credit: { type: mongoose.Schema.Types.Mixed, default: null },
    author: { type: mongoose.Schema.Types.Mixed, default: null },
    publisher: { type: mongoose.Schema.Types.Mixed, default: null },
    keywords: { type: String, default: null },
    slug: { type: String, default: null },
    label: { type: Number, default: 0 },
    readTimeMinutes: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    lastViewed: { type: Date, default: null },
    uniqueViews: { type: Number, default: 0 }
}, { 
    timestamps: true,
    // Optimize collection settings
    collection: 'articles'
});

// ===== PERFORMANCE INDEXES =====

// 1. Single field indexes for common queries
articleSchema.index({ date: -1 }); // Most important - used in date range queries (descending for latest first)
articleSchema.index({ headline: 1 }); // For duplicate detection and headline searches
articleSchema.index({ source: 1 }); // For filtering by news source
articleSchema.index({ label: 1 }); // For tension calculations
articleSchema.index({ viewCount: -1 }); // For popular articles (descending)
articleSchema.index({ slug: 1 }, { unique: true, sparse: true }); // Unique slugs for SEO

// 2. Compound indexes for complex queries
articleSchema.index({ date: -1, source: 1 }); // Date range + source filtering
articleSchema.index({ date: -1, label: 1 }); // Date range + tension analysis
articleSchema.index({ source: 1, date: -1 }); // Source-specific latest articles
articleSchema.index({ viewCount: -1, date: -1 }); // Popular recent articles

// 3. Text search index for full-text search capabilities
articleSchema.index({ 
    headline: 'text', 
    description: 'text', 
    keywords: 'text' 
}, {
    weights: {
        headline: 10,    // Higher weight for headlines
        description: 5,  // Medium weight for descriptions
        keywords: 3      // Lower weight for keywords
    },
    name: 'article_text_search'
});

// 4. TTL (Time To Live) index for automatic cleanup (optional)
// Uncomment if you want to automatically delete old articles
// articleSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // 1 year

// 5. Sparse indexes for optional fields
articleSchema.index({ articleUrl: 1 }, { sparse: true }); // Only index documents with articleUrl
articleSchema.index({ lastViewed: -1 }, { sparse: true }); // Only index viewed articles

// ===== SCHEMA OPTIMIZATIONS =====

// Pre-save middleware for data validation and optimization
articleSchema.pre('save', function(next) {
    // Convert headline to string if it's not null for better indexing
    if (this.headline && typeof this.headline !== 'string') {
        this.headline = String(this.headline);
    }
    
    // Ensure date is a valid number
    if (this.date && isNaN(this.date)) {
        this.date = Date.now();
    }
    
    // Generate slug from headline if not provided
    if (!this.slug && this.headline) {
        this.slug = this.headline
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100); // Limit slug length
    }
    
    next();
});

// Virtual for formatted date
articleSchema.virtual('formattedDate').get(function() {
    return this.date ? new Date(this.date).toISOString() : null;
});

// Static methods for common queries
articleSchema.statics.findByDateRange = function(startDate, endDate) {
    return this.find({
        date: { $gte: startDate, $lte: endDate }
    }).lean();
};

articleSchema.statics.findDuplicatesByHeadline = function() {
    return this.aggregate([
        {
            $group: {
                _id: "$headline",
                docs: { $push: "$_id" },
                count: { $sum: 1 }
            }
        },
        {
            $match: { count: { $gt: 1 } }
        }
    ]);
};

articleSchema.statics.getAverageLabelByDateRange = function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                averageLabel: { $avg: "$label" },
                count: { $sum: 1 }
            }
        }
    ]);
};

// Instance methods
articleSchema.methods.incrementViewCount = function() {
    this.viewCount += 1;
    this.lastViewed = new Date();
    return this.save();
};


articleSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.__v;
        return ret;
    }
});

// Enable virtuals in JSON
articleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Article', articleSchema);
