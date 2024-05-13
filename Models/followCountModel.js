
const mongoose = require('mongoose');

const countSchema = new mongoose.Schema({

  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organizer',
    required: true
  },
  TotalFollowers: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const countModel = mongoose.model('Count', countSchema);

module.exports = countModel;


