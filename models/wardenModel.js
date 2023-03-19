const mongoose = require('mongoose')


const wardenSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    role: {
        type: Number,
        required: true
    },
    hostel_name: {
        type: String,
        default: 'None',
        required: true
    }

})


const Warden = mongoose.model('Warden', wardenSchema)

module.exports = Warden

