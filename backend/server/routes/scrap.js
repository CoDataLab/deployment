const express = require('express');
const router = express.Router();
const Scrap = require("../models/Scrap");
const {authorizeRole} = require('../middleware/authMiddleware');



router.get("/count",authorizeRole("owner"), async (req, res) => {
    try {
        const count = await Scrap.countDocuments();
        return res.status(200).json({ count });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete("/delete",authorizeRole("owner"), async (req, res) => {
    const limit = parseInt(req.query.limit);

    if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ message: "Invalid limit provided." });
    }

    try {
        const documentsToDelete = await Scrap.find().limit(limit);

        if (documentsToDelete.length === 0) {
            return res.status(404).json({ message: "No documents to delete." });
        }
        const result = await Scrap.deleteMany({ _id: { $in: documentsToDelete.map(doc => doc._id) } });
        return res.status(200).json({ message: `${result.deletedCount} documents deleted.` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
module.exports = router;