const Testimonial = require('../models/testimonial.model');
const User = require('../models/user.model');
const {sendEmail} = require('../services/email.service');

exports.createTestimonial = async (req,res) => {
    try{
        const {rating, comment} = req.body;
        const testimonial = await Testimonial.create({
            user:req.user._id,
            rating,
            comment
        });

        if(process.env.ADMIN_EMAIL){
            await sendEmail(process.env.ADMIN_EMAIL, 'تقييم جديد', `<p>تقييم جديد من ${req.user.name}</p>`);
        }

        res.status(201).json({message:'testimonial submitted, pending approval', data:testimonial});
    }catch(err){
        res.status(500).json({error:err.message});
    }
};

exports.getApprovedTestimonials = async (req,res) => {
    const testimonials = await Testimonial.find({status:'approved'})
        .populate('user','name')
        .sort({createdAt:-1});
    res.status(200).json({message:'approved testimonials', data:testimonials});
};

exports.getPendingTestimonials = async (req,res) => {
    const testimonials = await Testimonial.find({status:'pending'})
        .populate('user','name email')
        .sort({createdAt:-1});
    res.status(200).json({message:'pending testimonials', data:testimonials});
};

// only the user who wrote a NEW testimonial gets notified of its status change;
// this endpoint just updates the record - actual notification happens here since
// this is the only place a testimonial's status changes after creation
exports.updateTestimonialStatus = async (req,res) => {
    const {status} = req.body;
    if(!['approved','declined'].includes(status)){
        return res.status(400).json({error:'invalid status'});
    }

    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, {status}, {new:true})
        .populate('user','name email');
    if(!testimonial){
        return res.status(404).json({error:'testimonial not found'});
    }

    await sendEmail(
        testimonial.user.email,
        'تحديث حالة تقييمك',
        `<p>مرحبًا ${testimonial.user.name}، تقييمك أصبحت حالته: ${status}</p>`
    );

    res.status(200).json({message:'testimonial status updated', data:testimonial});
};
