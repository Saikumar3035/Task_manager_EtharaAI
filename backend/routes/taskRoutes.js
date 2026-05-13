const express = require('express');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', protect, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const task = await Task.create({ ...req.body, createdBy: req.user._id });
        
        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        await ActivityLog.create({
            user: req.user._id,
            actionType: 'Created',
            entityType: 'Task',
            entityId: task._id,
            project: task.projectId,
            details: `Created task "${task.title}"`
        });

        res.status(201).json(populatedTask);
    } catch (error) { 
        res.status(400).json({ message: error.message }); 
    }
});
router.put('/:id', protect, async (req, res) => {
    try {
        const taskToUpdate = await Task.findById(req.params.id);
        if (!taskToUpdate) return res.status(404).json({ message: 'Task not found' });
        
        const isAssignedUser = taskToUpdate.assignedTo && taskToUpdate.assignedTo.toString() === req.user._id.toString();
        if (req.user.role !== 'admin' && !isAssignedUser) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        const oldStatus = taskToUpdate.status;
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (req.body.status && oldStatus !== req.body.status) {
            await ActivityLog.create({
                user: req.user._id,
                actionType: 'Status Changed',
                entityType: 'Task',
                entityId: updatedTask._id,
                project: updatedTask.projectId,
                details: `Changed status of "${updatedTask.title}" from ${oldStatus} to ${req.body.status}`
            });
        }
            
        res.json(updatedTask);
    } catch (error) { 
        res.status(400).json({ message: error.message }); 
    }
});
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;