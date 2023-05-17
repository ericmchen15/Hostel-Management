const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);

const vacateSchema = new mongoose.Schema({
  
    reg_no: {
    type: String,
    required: true
  },
  
  vacate_id: {
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
 
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }

});

const Vacate = mongoose.model('Vacate', vacateSchema);

module.exports = Vacate;