const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { errorHandler, verify, verifyAdmin } = require('../auth');

// Retrieve User's Cart
module.exports.getCart = (req, res) => {
    Cart.findOne({ userId: req.user.id })
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }
        res.status(200).send({ cart: cart });
    })
    .catch(error => errorHandler(error, req, res));
};

// Add to Cart
module.exports.addToCart = (req, res) => {
    const { productId, quantity } = req.body;
    
    Product.findById(productId)
    .then(product => {
        if (!product) {
            return res.status(404).send({ message: 'Product not found' });
        }

        const subtotal = product.price * quantity;

        return Cart.findOne({ userId: req.user.id })
        .then(cart => {
            if (!cart) {
                cart = new Cart({ userId: req.user.id, cartItems: [], totalPrice: 0 });
            }

            const cartItem = cart.cartItems.find(item => item.productId == productId);
            if (cartItem) {
                cartItem.quantity += quantity;
                cartItem.subtotal += subtotal;
            } else {
                cart.cartItems.push({ productId, quantity, subtotal });
            }

            cart.totalPrice += subtotal;
            return cart.save();
        })
        .then(cart => res.status(200).send({ message: 'Item added to cart successfully', cart }));
    })
    .catch(error => errorHandler(error, req, res));
};

// Update Product Quantity in Cart
module.exports.updateCartQuantity = (req, res) => {
    const { productId, newQuantity } = req.body;
    const userId = req.user.id;

    if (isNaN(newQuantity) || newQuantity <= 0) {
        return res.status(400).send({ message: 'Invalid quantity' });
    }

    Cart.findOne({ userId })
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        const cartItem = cart.cartItems.find(item => item.productId == productId);
        if (!cartItem) {
            return res.status(404).send({ error: 'Item not found in cart' });
        }

        if (typeof cartItem.price === 'undefined') {
            return Product.findById(productId)
            .then(product => {
                if (!product) {
                    return res.status(404).send({ error: 'Product not found' });
                }
                cartItem.price = product.price;

                cartItem.quantity = newQuantity;
                cartItem.subtotal = cartItem.price * newQuantity;

                cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

                return cart.save();
            })
            .then(cart => {
                res.status(200).send({ message: "Item quantity updated successfully", updatedCart: cart });
            });
        } else {
            cartItem.quantity = newQuantity;
            cartItem.subtotal = cartItem.price * newQuantity;

            cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

            return cart.save()
            .then(cart => {
                res.status(200).send({ message: "Item quantity updated successfully", updatedCart: cart });
            });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Angelo Start
// Remove Item from Cart
module.exports.removeFromCart = (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;

    Cart.findOne({ userId })
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        const cartItem = cart.cartItems.find(item => item.productId == productId);
        if (!cartItem) {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

        cart.cartItems = cart.cartItems.filter(item => item.productId != productId);
        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        return cart.save()
        .then(cart => {
            res.status(200).send({ message: 'Item removed from cart successfully', updatedCart: cart });
        });
    })
    .catch(error => errorHandler(error, req, res));
};
// Angelo End

//James Start
module.exports.clearCart = (req, res) => {
    const userId = req.user.id;
    
    Cart.findOne({ userId })
    .then(cart => {
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        if (cart.cartItems.length > 0) {
            cart.cartItems = [];
            cart.totalPrice = 0;
        } else {
            return res.status(200).send({ message: 'No items to remove' });
        }

        return cart.save();
    })
    .then(savedCart => {
        res.status(200).send({ message: 'Cart cleared successfully', cart: savedCart });
    })
    .catch(error => {
        errorHandler(error, req, res);
    });
};
//James End
