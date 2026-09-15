
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');


// ==================================================
// Find or Create Cart
// ==================================================
async function findOrCreateCart(req) {

    const guestId = req.body.guestId || req.query.guestId;

    let query;

    if (req.user) {
        query = {
            user: req.user._id
        };
    } else {

        if (!guestId) {
            throw new Error('guestId is required for guest cart');
        }

        query = {
            guestId
        };
    }

    let cart = await Cart.findOne(query);

    if (!cart) {

        cart = await Cart.create(
            req.user
                ? { user: req.user._id }
                : { guestId }
        );

    }

    return cart;
}



// ==================================================
// Recalculate Total
// ==================================================
function recalcTotal(cart) {

    cart.totalPrice = cart.items.reduce(
        (sum, item) =>
            sum + (item.priceAtOrder * item.quantity),
        0
    );

}



// ==================================================
// Refresh Price Flags
// ==================================================
async function refreshPriceFlags(cart) {

    for (const item of cart.items) {

        const product = await Product.findById(item.product);

        if (!product) {
            continue;
        }

        item.isPriceChanged =
            product.price !== item.priceAtOrder;
    }

}



// ==================================================
// Get Cart
// ==================================================
exports.getCart = async (req, res) => {

    try {

        const cart = await findOrCreateCart(req);

        await cart.populate(
            'items.product',
            'name imgURL slug price stock isActive isDeleted'
        );

        await refreshPriceFlags(cart);

        recalcTotal(cart);

        await cart.save();


        res.status(200).json({
            message: 'cart',
            data: cart
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};



// ==================================================
// Add To Cart
// ==================================================
exports.addToCart = async (req, res) => {

    try {

        const {
            productId,
            quantity
        } = req.body;


        // ------------------------------
        // Validate quantity
        // ------------------------------

        const qty = Number(quantity);

        if (!Number.isInteger(qty) || qty < 1) {

            return res.status(400).json({
                error: 'quantity must be a positive integer'
            });

        }


        // ------------------------------
        // Find Product
        // ------------------------------

        const product = await Product.findOne({

            _id: productId,
            isDeleted: false,
            isActive: true

        });


        if (!product) {

            return res.status(404).json({
                error: 'product not found'
            });

        }


        // ------------------------------
        // Check Stock
        // ------------------------------

        if (product.stock < qty) {

            return res.status(400).json({
                error: `only ${product.stock} items available`
            });

        }


        // ------------------------------
        // Cart
        // ------------------------------

        const cart = await findOrCreateCart(req);


        const existingItem = cart.items.find(
            item =>
                item.product.toString() ===
                productId.toString()
        );


        // ------------------------------
        // Existing item
        // ------------------------------

        if (existingItem) {

            const newQuantity =
                existingItem.quantity + qty;


            if (newQuantity > product.stock) {

                return res.status(400).json({
                    error: `only ${product.stock} items available`
                });

            }


            existingItem.quantity = newQuantity;

            existingItem.priceAtOrder =
                product.price;

            existingItem.isPriceChanged =
                false;

        }


        // ------------------------------
        // New item
        // ------------------------------

        else {

            cart.items.push({

                product: product._id,

                priceAtOrder: product.price,

                quantity: qty,

                isPriceChanged: false

            });

        }


        recalcTotal(cart);

        await cart.save();


        await cart.populate(
            'items.product',
            'name imgURL slug price stock isActive isDeleted'
        );


        res.status(200).json({

            message: 'added to cart',

            data: cart

        });


    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};



// ==================================================
// Remove From Cart
// ==================================================
exports.removeFromCart = async (req, res) => {

    try {

        const cart = await findOrCreateCart(req);

        const oldLength = cart.items.length;


        cart.items = cart.items.filter(
            item =>
                item._id.toString() !==
                req.params.itemId
        );


        if (cart.items.length === oldLength) {

            return res.status(404).json({
                error: 'item not found in cart'
            });

        }


        recalcTotal(cart);

        await cart.save();


        res.status(200).json({

            message: 'removed from cart',

            data: cart

        });


    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};



// ==================================================
// Accept New Price
// ==================================================
exports.acceptNewPrice = async (req, res) => {

    try {

        const cart = await findOrCreateCart(req);


        const item = cart.items.find(
            item =>
                item._id.toString() ===
                req.params.itemId
        );


        if (!item) {

            return res.status(404).json({
                error: 'item not found in cart'
            });

        }


        const product =
            await Product.findOne({

                _id: item.product,
                isDeleted: false,
                isActive: true

            });


        if (!product) {

            return res.status(404).json({
                error: 'product not found or inactive'
            });

        }


        if (item.quantity > product.stock) {

            return res.status(400).json({
                error: `only ${product.stock} items available`
            });

        }


        item.priceAtOrder =
            product.price;

        item.isPriceChanged =
            false;


        recalcTotal(cart);

        await cart.save();


        res.status(200).json({

            message: 'price accepted',

            data: cart

        });


    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};



// ==================================================
// Merge Guest Cart
// ==================================================
exports.mergeGuestCart = async (req, res) => {

    try {

        const { guestId } = req.body;


        if (!guestId) {

            return res.status(400).json({
                error: 'guestId is required'
            });

        }


        const guestCart =
            await Cart.findOne({ guestId });


        if (!guestCart || guestCart.items.length === 0) {

            return res.status(200).json({
                message: 'nothing to merge'
            });

        }


        let userCart =
            await Cart.findOne({
                user: req.user._id
            });


        if (!userCart) {

            userCart =
                await Cart.create({
                    user: req.user._id
                });

        }


        // ------------------------------
        // Merge items
        // ------------------------------

        for (const guestItem of guestCart.items) {

            const product =
                await Product.findOne({

                    _id: guestItem.product,

                    isDeleted: false,

                    isActive: true

                });


            if (!product) {
                continue;
            }


            const existing =
                userCart.items.find(
                    item =>
                        item.product.toString() ===
                        guestItem.product.toString()
                );


            if (existing) {

                const newQuantity =
                    existing.quantity +
                    guestItem.quantity;


                if (newQuantity <= product.stock) {

                    existing.quantity = newQuantity;

                } else {

                    existing.quantity = product.stock;

                }


                existing.priceAtOrder =
                    product.price;

                existing.isPriceChanged =
                    false;

            } else {

                const safeQuantity =
                    Math.min(
                        guestItem.quantity,
                        product.stock
                    );


                if (safeQuantity > 0) {

                    userCart.items.push({

                        product: product._id,

                        priceAtOrder: product.price,

                        quantity: safeQuantity,

                        isPriceChanged: false

                    });

                }

            }

        }


        recalcTotal(userCart);

        await userCart.save();


        await Cart.deleteOne({
            _id: guestCart._id
        });


        await userCart.populate(
            'items.product',
            'name imgURL slug price stock isActive isDeleted'
        );


        res.status(200).json({

            message: 'guest cart merged',

            data: userCart

        });


    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};
