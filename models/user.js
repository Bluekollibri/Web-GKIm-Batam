const mongoose = require('mongoose');
const User = mongoose.model('user',{
    nama :{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
        required: true
    },
    lahir:{
        type: Date,
        required: true
    },
    alamat : {
        type: String,
        required : true
    },
    role : {
        type : String,
        enum : ['admin', 'user'],
        default : 'user'
    }
});

module.exports = User;