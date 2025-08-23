const mongoose = require('mongoose');

const eventTaskSchema = new mongoose.Schema({
    taskName: { type: String, required: true },
    dateTime: { type: Date, required: true },
    sourceGroup: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in progress', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    finishedDate: { type: Date, default: null }
});

// Virtual for elapsed time (difference between dateTime and finishedDate)
eventTaskSchema.virtual('elapsedTime').get(function () {
    if (this.finishedDate) {
        const diffMs = this.finishedDate - this.dateTime; // difference in milliseconds
        return Math.floor(diffMs / 1000); // convert milliseconds to seconds
    }
    return null; // if finishedDate is null, no elapsed time
});

// Ensure the virtual field is included in the JSON output
eventTaskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('EventTask', eventTaskSchema);
