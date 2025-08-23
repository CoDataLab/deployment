const express = require('express');
const router = express.Router();
const EventTask = require("../models/EventTask");
const SourceGroup = require('../models/SourceGroup');
const schedule = require('node-schedule');
const {performTask} = require('../utils/eventTasks');
const {authorizeRole} = require('../middleware/authMiddleware');


router.post('/schedule', authorizeRole("owner"), async (req, res) => {
    const { taskName, dateTime, sourceGroup } = req.body;
    const logger = global.pipelineLogger;
    
    if (!taskName || !dateTime || !sourceGroup) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const sourceGroupData = await SourceGroup.findById(sourceGroup);

        if (!sourceGroupData) {
            return res.status(404).json({ error: 'Source Group not found' });
        }

        const task = new EventTask({
            taskName,
            dateTime,
            sourceGroup: sourceGroupData.name 
        });

        await task.save();
        
        logger.info(`Task scheduled: ${taskName} for ${dateTime} || Task : ${taskName} || Date : ${dateTime} `);

        schedule.scheduleJob(new Date(dateTime), async () => {
            try {
                logger.info(`Executing scheduled task: ${taskName} || Group : ${sourceGroupData.name}`);
                
                await performTask(task, sourceGroup);
        
                await EventTask.findByIdAndUpdate(task._id, {
                    $set: { status: 'completed', finishedDate: new Date() }
                }, { new: true });
        
            } catch (error) {
                logger.error(`Scheduled task execution failed: ${error.message} || Group : ${sourceGroupData.name} `);
                
                await EventTask.findByIdAndUpdate(task._id, {
                    $set: { status: 'failed', errorMessage: error.message }
                });
            }
        });

        res.status(200).json({ message: 'Task scheduled successfully', task });
    } catch (err) {
            logger.error(`Scheduled task execution failed: ${error.message} || Group : ${sourceGroupData.name} `);

        
        res.status(500).json({ error: 'Failed to schedule task' });
    }
});

// Execute task immediately
router.post('/execute', authorizeRole("owner"), async (req, res) => {
    const { taskName, sourceGroup } = req.body;
    const logger = global.pipelineLogger;
    
    if (!taskName || !sourceGroup) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const sourceGroupData = await SourceGroup.findById(sourceGroup);

        if (!sourceGroupData) {
            return res.status(404).json({ error: 'Source Group not found' });
        }

        const task = new EventTask({
            taskName,
            dateTime: new Date(),
            sourceGroup: sourceGroupData.name,
            status: 'in progress'
        });

        await task.save();
        
        logger.info(`Executing immediate task: ${taskName}`, {
            taskId: task._id,
            taskName: taskName,
            sourceGroup: sourceGroupData.name
        });

        // Execute task in background
        setImmediate(async () => {
            try {
                await performTask(task, sourceGroup);
                
                await EventTask.findByIdAndUpdate(task._id, {
                    $set: { status: 'completed', finishedDate: new Date() }
                }, { new: true });
                
            } catch (error) {
                logger.error(`Immediate task execution failed: ${error.message}`, {
                    taskId: task._id,
                    taskName: taskName,
                    error: error.message
                });
                
                await EventTask.findByIdAndUpdate(task._id, {
                    $set: { status: 'failed', errorMessage: error.message }
                });
            }
        });

        res.status(200).json({ message: 'Task execution started', task });
    } catch (err) {
        logger.error(`Failed to execute task: ${err.message}`, {
            taskName: taskName,
            error: err.message
        });
        
        res.status(500).json({ error: 'Failed to execute task' });
    }
});
router.get("/all",authorizeRole("owner"), async (req, res) => {
    try {
       
        const data = await EventTask.find().sort({ createdAt: -1 }).limit(100);
        if (!data.length) return res.status(404).json({ message: "No Event Task Found" });
        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message });
    }
});
router.delete('/delete/:id',authorizeRole("owner"), async (req, res) => {
    const { id } = req.params;

    try {
        const task = await EventTask.findById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const job = schedule.scheduledJobs[task._id];
        if (job) {
            job.cancel();
            console.log(`Scheduled job with ID ${task._id} canceled.`);
        }

        await EventTask.findByIdAndDelete(id);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

router.post('/schedule-group', authorizeRole("owner"), async (req, res) => {
    const { eventCount, interval, startTime, taskName, sourceGroup } = req.body;

    if (!eventCount || !interval || !startTime || !taskName || !sourceGroup) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (isNaN(eventCount) || isNaN(interval) || eventCount < 1 || interval < 5) {
        return res.status(400).json({ error: 'Invalid values: eventCount must be ≥ 1, interval must be ≥ 5' });
    }

    const start = new Date(startTime);
    const now = new Date();

    if (isNaN(start.getTime()) || start <= now) {
        return res.status(400).json({ error: 'Invalid start time. Must be a valid date in the future.' });
    }

    try {
        const sourceGroupData = await SourceGroup.findById(sourceGroup);
        if (!sourceGroupData) {
            return res.status(404).json({ error: 'Source Group not found' });
        }

        const scheduledTasks = [];

        for (let i = 0; i < eventCount; i++) {
            const scheduledDate = new Date(start.getTime() + i * interval * 60 * 1000);

            const task = new EventTask({
                taskName: `${taskName} #${i + 1}`,
                dateTime: scheduledDate,
                sourceGroup: sourceGroupData.name
            });

            await task.save();
            scheduledTasks.push(task);

            schedule.scheduleJob(scheduledDate, async () => {
                try {
                    await performTask(task, sourceGroup);

                    await EventTask.findByIdAndUpdate(task._id, {
                        $set: { status: 'completed', finishedDate: new Date() }
                    });
                } catch (error) {
                    console.error("Task execution failed:", error);
                    await EventTask.findByIdAndUpdate(task._id, {
                        $set: { status: 'failed' }
                    });
                }
            });
        }

        res.status(200).json({
            message: `${eventCount} tasks scheduled successfully`,
            scheduledTasks
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to schedule multiple tasks' });
    }
});


module.exports = router;
