const mongoose = require('mongoose');
const Reflection = mongoose.model('reflection',{
    judul :{
        type: String,
        required: true,
    },
    tanggal :{
        type: Date,
        required:true
    },
    ayat:{
        type: String,
        required:true
    },
    isian:{
        type: String,
        required: true
    }
});

module.exports = Reflection;