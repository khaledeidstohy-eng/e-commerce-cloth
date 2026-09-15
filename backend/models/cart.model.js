const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    priceAtOrder:{
        type:Number,
        required:true
    },
    isPriceChanged:{
        type:Boolean,
        default:false
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    }
});

const cartSchema = new mongoose.Schema({
    // absent for guest carts identified by a session/device id instead
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    },
    // used to identify a guest's cart before they log in, so it can be merged into their account
    guestId:{
        type:String,
        default:null
    },
    items:[cartItemSchema],
    totalPrice:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

module.exports = mongoose.model('Cart', cartSchema);
