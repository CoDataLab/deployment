const mongoose = require('mongoose');

const TasksSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true
    },
    estimation: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: String,
        required: false,
        trim: true
    },
    display: {
        type: Boolean,
        required: false,
        default:true ,
    },
    startTime: {  // Add startTime field
        type: Date,
        default: null  // Default to null if not set
    },
}, {
    timestamps: true // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model('Tasks', TasksSchema);