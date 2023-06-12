const mongoose = require('mongoose')


const wardenSchema = mongoose.Schema({

    is_open: {
        type: Boolean,
        required: true
    },
    

})


const Warden = mongoose.model('Warden', wardenSchema)

module.exports = Warden

