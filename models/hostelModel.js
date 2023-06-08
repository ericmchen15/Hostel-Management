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

  const messSchema = new mongoose.Schema({
    breakfast: {
      type: String,
      required: true,
    },
    lunch: {
      type: String,
      required: true,
    },
    dinner: {
        type: String,
        required: true,
      },
  });

const bedSchema = new mongoose.Schema({

    bed_no: {
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

    id:{
        type: String,
        required: true
    },
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
    warden: {
        type: Boolean,
        default: false,
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
    single_seater_id: {
        type: String
    },
    dept: {
        type: Map,
        of: departmentSchema,
        default: new Map(),
    },
    mess: {
        type: Map,
        of: messSchema,
        default: new Map()
    },

    totalRooms : {
        type: Number     
    },

    beds: [bedSchema]

})

const Hostel = mongoose.model('Hostel', hostelSchema);

module.exports = Hostel;