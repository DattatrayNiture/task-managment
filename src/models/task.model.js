const mongoose = require('mongoose');
const { schema } = require('../constant/text.constant');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, optional: true },
    is_active: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model(schema.task, taskSchema);
