const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  reg_no: {
    type: String,
    required: true
  },
  leave_id: {
    type: String,
    required: true
  },
  hostel_name: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  from: {
    type: Date,
    required: true
  },
  to: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;