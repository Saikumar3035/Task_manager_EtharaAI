const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', protect, async (req, res) => {
    try {
        const { projectId, limit = 20 } = req.query;
        let query = {};
        if (projectId) query.project = projectId;

        const logs = await ActivityLog.find(query)
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router; 