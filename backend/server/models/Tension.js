const mongoose = require('mongoose');

const TensionSchema = new mongoose.Schema({
  value: { type: Number },
  startDate: {
    type: Date,
    required: true, 
  },
  endDate: {
    type: Date,
    required: true, 
  },

}, { timestamps: true }); 
const Tension = mongoose.model('Tension', TensionSchema);

module.exports = Tension;