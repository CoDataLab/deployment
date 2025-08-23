// eventTasks.js - Enhanced with real-time logging
const { fetchRSSFeed } = require('./fetchRSS');
const { normalizeData } = require('./transformer');
const Scrap = require('../models/Scrap');
const Article = require('../models/Article');
const SourceGroup = require('../models/SourceGroup');
const TopKeywords = require('../models/TopKeywords');
const Source = require('../models/Source');
const Tweet = require('../models/Tweet');
const Tension = require('../models/Tension');
const extractTopKeywords = require('./reportingAnalyzer');
const { gatherTweets } = require("./tweetsWorker");
const pLimit = require('p-limit');
const Bottleneck = require('bottleneck');

const limiter = new Bottleneck({
    minTime: 100,
    maxConcurrent: 5
});

const concurrencyLimit = pLimit(3);

// Get logger instance
const getLogger = () => global.pipelineLogger;

const smartDelay = (attempt = 0, baseDelay = 1000) => {
    const delay = baseDelay * Math.pow(2, attempt);
    return new Promise(resolve => setTimeout(resolve, Math.min(delay, 30000)));
};

const withRetry = async (operation, maxRetries = 3, context = 'operation') => {
    const logger = getLogger();
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            logger.warning(`${context} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
            
            if (attempt === maxRetries) {
                throw new Error(`${context} failed after ${maxRetries + 1} attempts: ${error.message}`);
            }
            
            await smartDelay(attempt);
        }
    }
};

const saveTensionData = async (startDate, endDate) => {
    const logger = getLogger();
    logger.processing('Step 7: Saving Tension Data');

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        throw new Error('Invalid date range provided');
    }

    const existingTension = await Tension.findOne({
        startDate: start,
        endDate: end
    }).lean();

    if (existingTension) {
        logger.info('Tension data already exists for this date range');
        return existingTension.value;
    }

    const result = await Article.aggregate([
        {
            $match: {
                date: { $gte: start, $lte: end }
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

    if (!result.length || result[0].count === 0) {
        throw new Error('No articles found in the given date range');
    }

    const averageLabel = result[0].averageLabel;

    const tension = new Tension({
        value: averageLabel,
        startDate: start,
        endDate: end
    });

    await tension.save();
    logger.success(`Tension data saved successfully: ${averageLabel.toFixed(4)}`, { 
        tensionValue: averageLabel,
        articlesAnalyzed: result[0].count 
    });
    
    return averageLabel;
};

const removeDuplicates = async () => {
    const logger = getLogger();
    logger.processing('Step 6: Cleaning Database - Removing Duplicates');
    
    const pipeline = [
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
    ];

    const duplicates = await Article.aggregate(pipeline);
    let totalRemoved = 0;

    if (duplicates.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < duplicates.length; i += batchSize) {
            const batch = duplicates.slice(i, i + batchSize);
            const idsToRemove = [];
            
            batch.forEach(group => {
                const [keep, ...remove] = group.docs;
                idsToRemove.push(...remove);
            });

            if (idsToRemove.length > 0) {
                const result = await Article.deleteMany({ _id: { $in: idsToRemove } });
                totalRemoved += result.deletedCount;
            }
        }
    }

    logger.success(`Duplicate cleaning completed! Removed ${totalRemoved} articles`, { 
        duplicatesRemoved: totalRemoved,
        duplicateGroups: duplicates.length 
    });
    
    return totalRemoved;
};

const processSource = async (source) => {
    const logger = getLogger();
    
    return concurrencyLimit(async () => {
        logger.processing(`Processing source: ${source.source}`);
        
        try {
            const scrapedItems = await limiter.schedule(() => 
                withRetry(() => fetchRSSFeed(source.url, source.source), 2, `RSS fetch for ${source.source}`)
            );

            if (!scrapedItems || scrapedItems.length === 0) {
                logger.warning(`No items found for source: ${source.source}`);
                return 0;
            }

            await withRetry(async () => {
                await Scrap.insertMany(scrapedItems, { 
                    ordered: false,
                    writeConcern: { w: 1, j: false }
                });
            }, 2, `Scrap insertion for ${source.source}`);

            const normalizedData = await withRetry(async () => {
                return await normalizeData(JSON.stringify(scrapedItems));
            }, 2, `Data normalization for ${source.source}`);

            if (!normalizedData || normalizedData.length === 0) {
                logger.warning(`No normalized data for source: ${source.source}`);
                return 0;
            }

            await withRetry(async () => {
                await Article.insertMany(normalizedData, { 
                    ordered: false,
                    writeConcern: { w: 1, j: false }
                });
            }, 2, `Article insertion for ${source.source}`);

            logger.success(`Successfully processed ${normalizedData.length} articles from ${source.source}`, {
                source: source.source,
                articlesProcessed: normalizedData.length,
                scrapedItems: scrapedItems.length
            });
            
            return normalizedData.length;

        } catch (error) {
            logger.error(`Error fetching feed from ${source.source}: ${error.message}`, {
                source: source.source,
                error: error.message,
                url: source.url
            });
            return 0;
        }
    });
};

const processTopKeywords = async (startDate, endDate) => {
    const logger = getLogger();
    logger.processing('Step 8: Processing Top Keywords');
    
    try {
        const existingKeywords = await TopKeywords.findOne({
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        }).lean();

        if (existingKeywords) {
            logger.info('Keywords already exist for this date range');
            return;
        }

        const articlesForKeywords = await Article.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).lean();

        if (articlesForKeywords.length === 0) {
            logger.warning('No articles found for keyword extraction.');
            return;
        }

        const topKeywords = extractTopKeywords(articlesForKeywords);
        
        const topKeywordsData = new TopKeywords({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            topKeywords: topKeywords
        });

        await topKeywordsData.save();
        logger.success(`Top keywords saved successfully for ${articlesForKeywords.length} articles.`, {
            articlesAnalyzed: articlesForKeywords.length,
            keywordsExtracted: topKeywords.length
        });
        
    } catch (error) {
        logger.error(`Error processing top keywords: ${error.message}`);
        throw error;
    }
};

const cleanupTempData = async () => {
    const logger = getLogger();
    logger.processing('Step 9: Cleaning Temporary Data');
    
    try {
        const result = await Scrap.deleteMany({});
        logger.success(`Scrap collection cleaned successfully. Removed ${result.deletedCount} items.`, {
            itemsRemoved: result.deletedCount
        });
        return result.deletedCount;
    } catch (error) {
        logger.error(`Error cleaning scrap collection: ${error.message}`);
        throw error;
    }
};

const performTask = async (task, groupId) => {
    const logger = getLogger();
    const startTime = Date.now();
    
    // Set current task for logging context
    logger.setCurrentTask(task._id);
    
    logger.info(`${task.taskName} Started at ${new Date().toISOString()}`, {
        taskId: task._id,
        taskName: task.taskName,
        groupId: groupId
    });
    
    await task.updateOne({ status: 'in progress' });

    let totalProcessed = 0;
    let totalRemoved = 0;

    try {
        logger.processing('Step 1: Fetching Source Group');
        const sourceGroup = await SourceGroup.findById(groupId)
            .populate('sourceIds')
            .lean();
            
        if (!sourceGroup || !sourceGroup.sourceIds?.length) {
            throw new Error("No Source Group found or no sources available");
        }
        
        logger.info(`Processing source group: ${sourceGroup.name} with ${sourceGroup.sourceIds.length} sources`, {
            sourceGroupName: sourceGroup.name,
            sourceCount: sourceGroup.sourceIds.length
        });

        const sourceResults = await Promise.allSettled(
            sourceGroup.sourceIds.map(source => processSource(source))
        );

        sourceResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                totalProcessed += result.value;
            } else {
                logger.error(`Source ${sourceGroup.sourceIds[index].source} failed: ${result.reason}`);
            }
        });

        totalRemoved = await removeDuplicates();

        const endTime = Date.now();
        const startDate = endTime - 4 * 60 * 60 * 1000; // 4 hours ago
        
        await Promise.allSettled([
            saveTensionData(startDate, endTime),
            processTopKeywords(startDate, endTime)
        ]);

        await cleanupTempData();

        const duration = Date.now() - startTime;
        
        logger.success(`Task completed successfully in ${(duration / 1000).toFixed(2)}s`, {
            taskId: task._id,
            duration: duration,
            articlesProcessed: totalProcessed,
            duplicatesRemoved: totalRemoved,
            sourceGroupName: sourceGroup.name
        });
        
        await task.updateOne({ 
            status: 'completed',
            completedAt: new Date(),
            stats: {
                duration,
                articlesProcessed: totalProcessed,
                duplicatesRemoved: totalRemoved
            }
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Task failed after ${(duration / 1000).toFixed(2)}s: ${error.message}`, {
            taskId: task._id,
            duration: duration,
            articlesProcessed: totalProcessed,
            duplicatesRemoved: totalRemoved,
            error: error.message
        });
        
        await task.updateOne({ 
            status: 'failed',
            failedAt: new Date(),
            errorMessage: error.message,
            stats: {
                duration,
                articlesProcessed: totalProcessed,
                duplicatesRemoved: totalRemoved
            }
        });
        
        throw error;
    } finally {
        // Clear current task
        logger.setCurrentTask(null);
    }
};

module.exports = { 
    performTask,
    saveTensionData,
    removeDuplicates,
    processTopKeywords
};