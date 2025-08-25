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
  ],
  totalCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('SourceGroup', SourceGroupSchema);
