const mongoose = require('mongoose');
const Timetable = mongoose.model('timetable',{
    jadwal :{
        type: String,
        required: true,
    },
    tanggal :{
        type: Date,
        required:true
    },
    pembicara :{
        type: String,
        required:true
    },
    ibadah : {
        type : String,
        enum : ['umum', 'pemuda','remaja','usindah','pria','wanita','keluarga muda'],
        default : 'umum'
    }
});

module.exports = Timetable;