const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);

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
    type: DateOnly,
    required: true
  },
  to: {
    type: DateOnly,
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