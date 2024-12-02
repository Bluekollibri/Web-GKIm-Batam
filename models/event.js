const mongoose = require('mongoose');
const Event = mongoose.model('event',{
    nama :{
        type: String,
        required: true,
    },
    tanggal:{
        type: Date,
        required: true,
    },
    deskripsi:{
        type: String,
        required: true
    }
});

module.exports = Event;