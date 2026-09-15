const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const {sendEmail} = require('../services/email.service');
const mongoose = require('mongoose');

// admin gets notified of new orders and new testimonials only
async function notifyAdmin(subject, html){
    if(process.env.ADMIN_EMAIL){
        await sendEmail(process.env.ADMIN_EMAIL, subject, html);
    }
}

exports.createOrder = async (req,res) => {
    const {address, mobilePhone, name, nationalId, governorate, shippingCost} = req.body;
    const userId = req.user._id;

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const cart = await Cart.findOne({user:userId}).session(session);
        if(!cart || cart.items.length === 0){
            throw new Error('cart is empty');
        }

        const orderItems = [];
        let total = shippingCost || 0;

        for(const item of cart.items){
            // atomic stock check + decrement, prevents overselling if stock ran out
            // between the item being added to the cart and the order being placed
            const product = await Product.findOneAndUpdate(
                {_id:item.product, stock:{$gte:item.quantity}, isDeleted:false, isActive:true},
                {$inc:{stock:-item.quantity, salesCount:item.quantity}},
                {new:true, session}
            );

            if(!product){
                throw new Error(`a product in your cart is no longer available in the requested quantity`);
            }

            orderItems.push({
                product:product._id,
                priceAtOrder:product.price,
                quantity:item.quantity
            });
            total += product.price * item.quantity;
        }

        const [order] = await Order.create([{
            user:userId,
            items:orderItems,
            address,
            mobilePhone,
            name,
            nationalId,
            price:total,
            shippingCost:shippingCost || 0,
            governorate,
            status:'pending'
        }],{session});

        // empty the cart after a successful order
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save({session});

        await session.commitTransaction();
        session.endSession();

        await notifyAdmin('طلب جديد', `<p>طلب جديد من ${name}، الإجمالي: ${total} جنيه</p>`);

        res.status(201).json({message:'order created', data:order});
    }catch(err){
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({error:err.message});
    }
};

exports.getMyOrders = async (req,res) => {
    const orders = await Order.find({user:req.user._id}).sort({createdAt:-1});
    res.status(200).json({message:'my orders', data:orders});
};

exports.getAllOrders = async (req,res) => {
    const orders = await Order.find().populate('user','name email').sort({createdAt:-1});
    res.status(200).json({message:'all orders', data:orders});
};

// admin: free movement between any status
exports.updateOrderStatus = async (req,res) => {
    const {status} = req.body;
    const validStatuses = ['pending','in progress','confirmed','shipped','received','refund'];
    if(!validStatuses.includes(status)){
        return res.status(400).json({error:'invalid status'});
    }

    const order = await Order.findByIdAndUpdate(req.params.id, {status}, {new:true});
    if(!order){
        return res.status(404).json({error:'order not found'});
    }
    res.status(200).json({message:'order status updated', data:order});
};

// user: can only request a refund, and only once the order has been shipped/received
exports.requestRefund = async (req,res) => {
    const order = await Order.findOne({_id:req.params.id, user:req.user._id});
    if(!order){
        return res.status(404).json({error:'order not found'});
    }
    if(!['shipped','received'].includes(order.status)){
        return res.status(400).json({error:'refund can only be requested after the order has been shipped or received'});
    }

    order.status = 'refund';
    await order.save();

    await notifyAdmin('طلب استرجاع', `<p>العميل ${order.name} طلب استرجاع الطلب رقم ${order._id}</p>`);

    res.status(200).json({message:'refund requested', data:order});
};

// reports ------------------------------------------------------------------

// GET /order/report/sales?startDate=&endDate=
exports.getSalesReport = async (req,res) => {
    const {startDate, endDate} = req.query;
    const filter = {status:{$ne:'refund'}};
    if(startDate || endDate){
        filter.createdAt = {};
        if(startDate) filter.createdAt.$gte = new Date(startDate);
        if(endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const result = await Order.aggregate([
        {$match:filter},
        {$group:{_id:null, totalSales:{$sum:'$price'}, ordersCount:{$sum:1}}}
    ]);

    res.status(200).json({
        message:'sales report',
        data: result[0] || {totalSales:0, ordersCount:0}
    });
};

// GET /order/report/top-products
exports.getTopProductsReport = async (req,res) => {
    const limit = Number(req.query.limit) || 5;

    const result = await Order.aggregate([
        {$match:{status:{$ne:'refund'}}},
        {$unwind:'$items'},
        {$group:{_id:'$items.product', totalOrdered:{$sum:'$items.quantity'}}},
        {$sort:{totalOrdered:-1}},
        {$limit:limit},
        {$lookup:{from:'products', localField:'_id', foreignField:'_id', as:'product'}},
        {$unwind:'$product'},
        {$project:{_id:0, product:'$product.name', totalOrdered:1}}
    ]);

    res.status(200).json({message:'top products', data:result});
};
