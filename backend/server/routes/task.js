const express = require('express');
const router = express.Router();
const Tasks = require("../models/Tasks") ;
const {authorizeRole} = require('../middleware/authMiddleware');
const NodeCache = require('node-cache');

router.get("/all", authorizeRole("owner"), async (req, res) => {
    try {
        const tasks = await Tasks.find({ display: true }); // Filtering tasks with display: true
        if (!tasks.length) return res.status(404).json({ message: "No tasks found" });

        const totaltasks = await Tasks.countDocuments({ display: true }); // Counting only displayed tasks

        res.status(200).json({ totaltasks, tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/add', async (req, res) => {
    const { name, status, estimation ,owner} = req.body;

    // Validate input
    if (typeof name !== 'string' || !name.trim() ||
        typeof status !== 'string' || !status.trim() ||
        typeof owner !== 'string' || !owner.trim() ||
        typeof estimation !== 'string' || !estimation.trim()) {
        return res.status(400).json({ message: "All fields are required and must be non-empty strings." });
    }

    try {
        const task = new Tasks({ name, status, estimation,owner });
        await task.save();

        return res.status(201).json({
            message: "Task created successfully.",
            task,
        });
    } catch (error) {
        console.error("Error creating task:", error);
        return res.status(500).json({ message: "An error occurred while creating the task." });
    }
});

// Update an existing task
router.put('/update/:id',authorizeRole("owner"), async (req, res) => {
    const { id } = req.params;
    const { name, status, estimation } = req.body;

    try {
        const task = await Tasks.findByIdAndUpdate(
            id,
            { name, status, estimation },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({
            message: "Task updated successfully",
            task,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
router.delete('/delete/:id',authorizeRole("owner"), async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Tasks.findByIdAndUpdate(id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        task.display = false ;

        await task.save();
        res.status(200).json({
            message: "Task deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
