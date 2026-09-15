const cors = require('cors');
const allowedOrigins = process.env.ALLOWED_ORIGINS;

const corsOptions = {
    origin:function (origin, cb) {
        if(!origin) return cb(null, true);
        if(allowedOrigins && allowedOrigins.includes(origin)){
            return cb(null, true);
        }else{
            return cb(new Error('Origin policy: Origin not allowed'));
        }
    },
    credentials:true,
    methods:['GET','POST','PUT','PATCH','DELETE'],
    allowedHeaders:['Content-Type','Authorization']
};

module.exports = cors(corsOptions);
