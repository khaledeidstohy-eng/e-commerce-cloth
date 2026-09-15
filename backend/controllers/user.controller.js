const User = require('../models/user.model');
const Order = require('../models/order.model');

exports.getAllUsers = async (req,res) => {
    const myUsers = await User.find().select('-password');
    res.status(200).json({message:'users list', data:myUsers});
};

exports.getMyProfile = async (req,res) => {
    res.status(200).json({message:'my profile', data:req.user});
};

// addresses ----------------------------------------------------------------

exports.addAddress = async (req,res) => {
    try{
        const myUser = await User.findById(req.user._id);
        if(req.body.isDefault){
            myUser.addresses.forEach(a => a.isDefault = false);
        }
        myUser.addresses.push(req.body);
        await myUser.save();
        const userResponse = myUser.toObject();
        delete userResponse.password;
        res.status(201).json({message:'address added', data:userResponse});
    }catch(err){
        res.status(500).json({error:err.message});
    }
};

exports.updateAddress = async (req,res) => {
    const myUser = await User.findById(req.user._id);
    const address = myUser.addresses.id(req.params.addressId);
    if(!address){
        return res.status(404).json({error:'address not found'});
    }
    if(req.body.isDefault){
        myUser.addresses.forEach(a => a.isDefault = false);
    }
    Object.assign(address, req.body);
    await myUser.save();
    const userResponse = myUser.toObject();
    delete userResponse.password;
    res.status(200).json({message:'address updated', data:userResponse});
};

exports.removeAddress = async (req,res) => {
    const myUser = await User.findByIdAndUpdate(
        req.user._id,
        {$pull:{addresses:{_id:req.params.addressId}}},
        {new:true}
    ).select('-password');
    res.status(200).json({message:'address removed', data:myUser});
};

// admin: block/unblock a user account -----------------------------------

exports.toggleBlock = async (req,res) => {
    const myUser = await User.findById(req.params.id);
    if(!myUser){
        return res.status(404).json({error:'user not found'});
    }
    myUser.isBlocked = !myUser.isBlocked;
    await myUser.save();
    res.status(200).json({message:'user block status updated', data:{isBlocked:myUser.isBlocked}});
};

// order history for the logged-in user -----------------------------------

exports.getMyOrderHistory = async (req,res) => {
    const orders = await Order.find({user:req.user._id}).sort({createdAt:-1});
    res.status(200).json({message:'my order history', data:orders});
};
