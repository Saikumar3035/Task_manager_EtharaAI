const mongoose = require('mongoose');
const ActivityLogSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
        actionType: { 
        type: String, 
        required: true,
        enum: ['Created', 'Updated', 'Deleted', 'Status Changed', 'Assigned'] 
    },
        entityType: { 
        type: String, 
        required: true,
        enum: ['Task', 'Project', 'User'] 
    },
    entityId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true 
    },
    
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project' 
    },
    details: {
        type: mongoose.Schema.Types.Mixed 
    }

}, { timestamps: true }); 
ActivityLogSchema.index({ project: 1, createdAt: -1 }); 
ActivityLogSchema.index({ entityId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);