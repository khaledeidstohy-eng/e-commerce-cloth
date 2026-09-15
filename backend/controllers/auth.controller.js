const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const token = (user) => {
    return jwt.sign(
        {id:user._id, role:user.role, name:user.name},
        process.env.SECRET_KEY,
        {expiresIn:process.env.JWT_EXPIRES_IN}
    );
};

exports.register = async (req,res) => {
    try{
        const {name, email, password, gender, dob, mobilePhone, nationalId} = req.body;
        const myUser = await User.create({name, email, password, gender, dob, mobilePhone, nationalId, role:'user'});

        const userResponse = myUser.toObject();
        delete userResponse.password;

        res.status(201).json({message:'user created', data:userResponse});
    }catch(err){
        res.status(500).json({error:err.message});
    }
};

exports.login = async (req,res) => {
    const {email, password} = req.body;
    const myUser = await User.findOne({email});
    if(!myUser || !(await myUser.isCorrectPassword(password))){
        return res.status(401).json({error:'invalid email or password'});
    }
    if(myUser.isBlocked){
        return res.status(403).json({error:'account is blocked'});
    }

    const accessToken = token(myUser);
    res.status(200).json({message:'logged in', token:accessToken});
};
