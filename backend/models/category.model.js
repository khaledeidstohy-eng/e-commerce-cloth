const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    // if null => main category (men, women, Summer, Winter)
    // if set  => sub-category (pants, shirts...) belonging to a main category
    parent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        default:null
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Category', categorySchema);
