const express = require('express');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const project = await Project.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json(project);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

// Example backend route
router.get('/', protect, async (req, res) => {
  try {
    // Find projects where the user is a member
    const projects = await Project.find({ 
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('members', 'name email');
        res.json(updatedProject);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: "Project deleted successfully" });
    } catch (error) { res.status(400).json({ message: error.message }); }
});

module.exports = router;