const SourceGroup = require("../models/SourceGroup");
const Source = require('../models/Source');
const {createGroupsForAllCategories }= require('../utils/sourceGrouper')
const express = require('express');
const router = express.Router();


const syncSourceGroup = async (groupName, findQuery) => {
    try {
        // Find all matching sources and select only their _id field for efficiency
        const sources = await Source.find(findQuery).select('_id').lean();
        
        // Map the results to an array of ObjectIds
        const sourceIds = sources.map(source => source._id);

        // Use a single, atomic "upsert" operation.
        // This finds a group by name and updates it, or creates it if it doesn't exist.
        // It's more efficient and safer than find-then-save.
        await SourceGroup.findOneAndUpdate(
            { name: groupName },
            {
                name: groupName,
                sourceIds: sourceIds,
                totalCount: sourceIds.length
            },
            { upsert: true } // Key option: creates the doc if it doesn't exist
        );
    } catch (error) {
        console.error(`Failed to sync source group "${groupName}":`, error);
        throw error; // Propagate error to be caught by the route handler
    }
};


const syncAllSourceGroups = async () => {
    // 1. Sync the "All Sources" group
    await syncSourceGroup('All Sources', {}); // Empty query {} matches all documents

    // 2. Sync all groups based on categories
    const categories = await Source.distinct('category');

    // **THE FIX**: Filter out any null, undefined, or empty string categories
    const validCategories = categories.filter(Boolean);

    // Create an array of promises to run all updates in parallel for max speed
    const categoryUpdatePromises = validCategories.map(category =>
        syncSourceGroup(category, { category: category })
    );

    // Wait for all parallel updates to complete
    await Promise.all(categoryUpdatePromises);
};


router.get('/all', async (req, res) => {
    try {
        await syncAllSourceGroups();

        const groups = await SourceGroup.find().populate({
          path: 'sourceIds',
          select: 'name url category' 
        });

        res.json({ message: 'Source groups synchronized and retrieved successfully.', groups });

    } catch (error) {
        console.error('Error in GET /all source groups route:', error);

        res.status(500).json({
            message: 'An internal server error occurred while fetching source groups.',
            error: 'Operation failed'
        });
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
module.exports = router;