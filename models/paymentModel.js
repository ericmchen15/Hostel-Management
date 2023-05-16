const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    payment_id :{
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    hostel_name : {
        type: String,
        required: true
    }
})

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment