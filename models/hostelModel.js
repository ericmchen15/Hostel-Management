const mongoose = require('mongoose');


const departmentSchema = new mongoose.Schema({
    vacancy: {
      type: String,
      required: true,
    },
    quota: {
      type: Number,
      required: true,
    },
  });

const roomSchema = new mongoose.Schema({
    room_no: {
        type: Number,
        required: true
    },

    vacant: {
        type: Boolean,
        default: true
    },

    student_allocated: {
        type: String,
        default: "NA"
    },

    student_reg_no: {
        type: String,
        default: "NA"
    }
});


const hostelSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    vacancy: {
        type: Number,
        default: 1
    },
    contact: {
        type: String,
        required: true
    },
    dept: {
        type: Map,
        of: departmentSchema,
        default: new Map(),
    },
    rooms: [roomSchema]

})

const Hostel = mongoose.model('Hostel', hostelSchema);

module.exports = Hostel;