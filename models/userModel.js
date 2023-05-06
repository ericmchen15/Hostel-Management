const mongoose = require('mongoose')
const DateOnly = require('mongoose-dateonly')(mongoose);

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    reg_no: {
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
    dept: {
        type: String
    },
    semester: {
        type: String
    },
    percentage: {
        type: Number
    },
    guardian_name: {
        type: String
    },
    guardian_phone: {
        type: String
    },
    address: {
        type: String
    },
    gender: {
        type:String,
        required: true
    },
    role: {
        type: Number,
        required: true
    },
    is_verified: {
        type: Number,
        default: 1
    },
    hostel_allocated: {
        
        status:{
            type: String,
            enum: ['pending', 'approved', 'rejected', 'NA'],
            default: 'NA',
        },
        hostel_name: {
            type: String,
            default: 'NA',
            required: true
        },
        room_no: {
            type: Number,
            default: 0,
            required: true
        }

    },
    payment_status : {
        type: String,
        enum: ['approved', 'rejected', 'NA'],
        default: 'NA'
    },
    payment_status_id: {
        type: String
    },
    user_created_timestamp: {
        type: DateOnly
    },
    user_vacated_timestamp: {
        type: DateOnly
    },
    user_allocation_batch: {
        type: String,
        enum: ['applied','present','past' ]
    },
    user_customer_id: {
        type: String
    },

})


const User = mongoose.model('User', userSchema)

module.exports = User

