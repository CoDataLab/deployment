const mongoose = require('mongoose');

const SourceGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    sourceIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Source'
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('SourceGroup', SourceGroupSchema);
