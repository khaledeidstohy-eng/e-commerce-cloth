const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    comment:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:['pending','approved','declined'],
        default:'pending'
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
