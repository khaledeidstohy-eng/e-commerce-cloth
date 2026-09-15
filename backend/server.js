require('dotenv').config();
const express = require('express');
const {connectDB} = require('./config/db.config');
const corsMiddleware = require('./middlewares/cors.middleware');

const app = express();
const port = process.env.PORT || 3000;

connectDB();

app.use(corsMiddleware);
app.use(express.json());
app.use('/files', express.static('uploads'));

app.use('/api/v1/auth', require('./routes/auth.route'));
app.use('/api/v1/user', require('./routes/user.route'));
app.use('/api/v1/category', require('./routes/category.route'));
app.use('/api/v1/product', require('./routes/product.route'));
app.use('/api/v1/cart', require('./routes/cart.route'));
app.use('/api/v1/order', require('./routes/order.route'));
app.use('/api/v1/testimonial', require('./routes/testimonial.route'));

// global error handler: catches multer errors, JSON parse errors, and any
// other error that reaches here, and always responds with JSON instead of
// Express's default HTML error page
app.use((err,req,res,next)=>{
    console.log('unhandled error:', err.message);
    res.status(err.status || 500).json({error: err.message || 'server error'});
});

app.listen(port, _ => console.log(`server started at port: ${port}`));
