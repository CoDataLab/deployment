const Source = require('../models/Source');
const SourceGroup = require('../models/SourceGroup');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 1500 });

const createOrUpdateSourceGroup = async (groupName, category) => {
    const cacheKey = `sourceGroup:${groupName}`;

    // Check if data exists in cache
    let cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData; // Return cached result
    }

    const sources = await Source.find({ category });
    const sourceIds = sources.map(source => source._id);
    const totalCount = sources.length;

    let sourceGroup = await SourceGroup.findOne({ name: groupName });

    if (sourceGroup) {
        sourceGroup.sourceIds = sourceIds;
        sourceGroup.totalCount = totalCount;
        sourceGroup.markModified('sourceIds');
        sourceGroup.markModified('totalCount');
        await sourceGroup.save();
    } else {
        sourceGroup = new SourceGroup({ name: groupName, sourceIds, totalCount });
        await sourceGroup.save();
    }

    // Store in cache
    cache.set(cacheKey, sourceGroup, 1500); // 25 minutes

    return sourceGroup;
};

const createGroupsForAllCategories = async () => {
    try {
        const categories = await Source.distinct('category'); // Get all unique categories
        for (const category of categories) {
            await createOrUpdateSourceGroup(category, category); // Use category as groupName
        }
        console.log('All source groups updated successfully');
    } catch (error) {
        console.error('Error creating source groups:', error);
    }
};

module.exports = { createOrUpdateSourceGroup, createGroupsForAllCategories };