const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    priceAtOrder:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    }
});

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[orderItemSchema],
    // address captured as a plain string snapshot at order time, so it stays
    // accurate even if the user edits/deletes that address afterwards
    address:{
        type:String,
        required:true
    },
    mobilePhone:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    nationalId:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    shippingCost:{
        type:Number,
        default:0
    },
    governorate:{
        type:String
    },
    // admin can move freely between these
    status:{
        type:String,
        enum:['pending','in progress','confirmed','shipped','received','refund'],
        default:'pending'
    },
    orderedAt:{
        type:Date,
        default:Date.now
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Order', orderSchema);
