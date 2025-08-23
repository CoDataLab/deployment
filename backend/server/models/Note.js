const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Urgent', 'Hint', 'Idea', 'Event', 'Useful Link'], 
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
   
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Note', NoteSchema);
