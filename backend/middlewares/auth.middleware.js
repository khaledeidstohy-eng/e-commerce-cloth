const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.authenticate = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader?.startsWith('Bearer ')){
        return res.status(401).json({error:'no token provided'});
    }
    const token = authHeader.split(' ')[1];
    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const myUser = await User.findById(decoded.id).select('-password');
        if(myUser){
            if(myUser.isBlocked){
                return res.status(403).json({error:'account is blocked'});
            }
            req.user = myUser;
            return next();
        }
        return res.status(401).json({error:'invalid token'});
    }catch(err){
        return res.status(401).json({error:'invalid token'});
    }
};
