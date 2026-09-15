const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    label:{
        type:String,
        default:'المنزل'
    },
    street:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    governorate:{
        type:String,
        required:true
    },
    isDefault:{
        type:Boolean,
        default:false
    }
});

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    gender:{
        type:String,
        enum:['male','female']
    },
    dob:{
        type:Date
    },
    mobilePhone:{
        type:String
    },
    nationalId:{
        type:String
    },
    addresses:[addressSchema],
    isBlocked:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
});

// fully async, no `next` callback — mongoose waits for the returned promise
userSchema.pre('save', async function () {
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 12);
    }
});

userSchema.methods.isCorrectPassword = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
