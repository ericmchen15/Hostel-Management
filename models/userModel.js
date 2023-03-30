const mongoose = require('mongoose')


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
            enum: ['pending', 'approved', 'rejected', 'N/A'],
            default: 'N/A',
        },
        hostel_name: {
            type: String,
            default: 'None',
            required: true
        },
        room_no: {
            type: Number,
            default: 0,
            required: true
        }

    }

})


const User = mongoose.model('User', userSchema)

module.exports = User

