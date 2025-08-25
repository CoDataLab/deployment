const SourceGroup = require("../models/SourceGroup");
const Source = require('../models/Source');
const express = require('express');
const router = express.Router();

const NodeCache = require('node-cache');

// Create cache instance with 3 min TTL (time-to-live)
const cache = new NodeCache({ stdTTL: 180 });



router.get('/all', async (req, res) => {
  try {
    // Check cache
    const cachedGroups = cache.get("allSourceGroups");
    if (cachedGroups) {
      return res.json({
        message: 'Source groups retrieved successfully. (cached)',
        groups: cachedGroups
      });
    }

    // Get all sources
    const sources = await Source.find();
    const allSourceIds = sources.map(source => source._id);
    const totalCount = sources.length;

    // Update or create the "All Sources" group
    let allSourcesGroup = await SourceGroup.findOne({ name: 'All Sources' });
    if (allSourcesGroup) {
      allSourcesGroup.sourceIds = allSourceIds;
      allSourcesGroup.totalCount = totalCount;
      await allSourcesGroup.save();
    } else {
      allSourcesGroup = new SourceGroup({
        name: 'All Sources',
        sourceIds: allSourceIds,
        totalCount
      });
      await allSourcesGroup.save();
    }

    // Create groups for categories
    await createGroupsForAllCategories();

    // Fetch all groups and populate
    const groups = await SourceGroup.find().populate('sourceIds');

    // Save to cache with 3 min TTL
    cache.set("allSourceGroups", groups, 180);

    res.json({ message: 'Source groups retrieved successfully.', groups });
  } catch (error) {
    console.error('Error fetching source groups:', error.message);
    res.status(500).json({ message: 'Failed to fetch source groups.', error });
  }
});


router.post('/add-group', async (req, res) => {
    try {
        const { name, sourceIds } = req.body;

        const group = new SourceGroup({ name, sourceIds });
        await group.save();

        res.json({ message: 'Source group created successfully.', group });
    } catch (error) {
        console.error('Error creating source group:', error.message);
        res.status(500).json({ message: 'Failed to create source group.', error });
    }
});

router.put('/update-group/:id', async (req, res) => {
    try {
        const { name, sourceIds } = req.body;
        const group = await SourceGroup.findByIdAndUpdate(req.params.id, { name, sourceIds }, { new: true });

        if (!group) {
            return res.status(404).json({ message: 'Source group not found.' });
        }

        res.json({ message: 'Source group updated successfully.', group });
    } catch (error) {
        console.error('Error updating source group:', error.message);
        res.status(500).json({ message: 'Failed to update source group.', error });
    }
});

router.delete('/delete-group/:id', async (req, res) => {
    try {
        const group = await SourceGroup.findByIdAndDelete(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Source group not found.' });
        }

        res.json({ message: 'Source group deleted successfully.', group });
    } catch (error) {
        console.error('Error deleting source group:', error.message);
        res.status(500).json({ message: 'Failed to delete source group.', error });
    }
});
router.get('/group-count/:id', async (req, res) => {
    try {
        const group = await SourceGroup.findById(req.params.id).populate('sourceIds');

        if (!group) {
            return res.status(404).json({ message: 'Source group not found.' });
        }

        const sourceCount = group.sourceIds.length;

       return res.status(200).json({
            message: 'Source group retrieved successfully.',
            sourceCount
        });
    } catch (error) {
        console.error('Error fetching source group:', error.message);
        res.status(500).json({ message: 'Failed to fetch source group.', error: error.message });
    }
});

async function createGroupsForAllCategories() {
  try {
    // Get all sources
    const sources = await Source.find();

    // Group by category
    const categoryGroups = {};
    for (const src of sources) {
      const cat = src.category || 'Uncategorized';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(src._id);
    }

    // Upsert each category group
    for (const [category, ids] of Object.entries(categoryGroups)) {
      let group = await SourceGroup.findOne({ name: category });
      if (group) {
        group.sourceIds = ids;
        group.totalCount = ids.length;
        await group.save();
      } else {
        await new SourceGroup({
          name: category,
          sourceIds: ids,
          totalCount: ids.length
        }).save();
      }
    }
  } catch (err) {
    console.error("Error creating category groups:", err.message);
  }
}

module.exports = router;
