const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendEmail = async (to, subject, html) => {
    try{
        await transporter.sendMail({
            from: `"المتجر" <${process.env.EMAIL_USER}>`,
            to, subject, html
        });
    }catch(err){
        console.log('email send error:', err.message);
    }
};
