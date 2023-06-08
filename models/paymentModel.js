const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payment_id: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hostel_name: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true
  },
  reg_no: {
    type: String,
    required: true
  },
  status : {
    type: String,
    enum: ['paid', 'due', 'NA'],
    default: 'due'
},
})

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment