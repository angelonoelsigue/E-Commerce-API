const Order = require('../models/Order');
const { errorHandler } = require('../auth');
const Cart = require('../models/Cart');

// Create Order
module.exports.createOrder = (req, res) => {
    const userId = req.user.id;

    // Find the user's cart
    Cart.findOne({ userId })
        .then(cart => {
            if (!cart || !cart.cartItems.length) {
                return res.status(404).send({ error: 'No Items to Checkout' });
            }

            // Extract productsOrdered and calculate totalPrice
            const productsOrdered = cart.cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                subtotal: item.subtotal
            }));
            const totalPrice = cart.totalPrice;

            const newOrder = new Order({
                userId,
                productsOrdered,
                totalPrice,
                status: 'Pending'
            });

            // Save the new order
            return newOrder.save()
                .then(order => {
                    // Clear the user's cart
                    cart.cartItems = [];
                    cart.totalPrice = 0;
                    return cart.save()
                        .then(() => {
                            res.status(201).send({ message: 'Order created successfully' });
                        });
                });
        })
        .catch(error => errorHandler(error, req, res));
};


// Retrieve logged in user's orders
module.exports.getMyOrders = (req, res) => {
    const userId = req.user.id;

    Order.find({ userId })
    .populate({
        path: 'productsOrdered.productId', 
        select: 'name' // Fetch only the product name
    })
    .then(orders => res.status(200).send({ orders: orders }))
    .catch(error => errorHandler(error, req, res));
};

// Retrieve all users' orders
module.exports.getAllOrders = (req, res) => {
    Order.find({})
    .populate({
        path: 'productsOrdered.productId',
        select: 'name'
    })
    .populate({
        path: 'userId',
        select: 'email'
    })
    .then(orders => res.status(200).send({ orders: orders }))
    .catch(error => errorHandler(error, req, res));
};
