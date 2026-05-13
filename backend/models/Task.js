const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: String }, 
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);