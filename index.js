const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const userRoutes = require("./routes/user");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const productRoutes = require("./routes/product");

// Environment Setup
require('dotenv').config();

const app = express();

// Connecting to MongoDB Atlas
mongoose.connect(process.env.MONGODB_STRING);

// If the connection is successful, output in the console
mongoose.connection.once("open", () => console.log("We're connected to the cloud database"));

// Allows your app to read json data
app.use(express.json());
// Allows your app to read data from forms
app.use(express.urlencoded({extended:true}));

// Server setup
const port = 3000;

const corsOptions = {
	origin: ['http://localhost:8000', 'http://localhost:3000', 'https://e-commerce-app-client-rust.vercel.app'],
	credentials: true,
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

// Use the routes
app.use('/users', userRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);

if(require.main === module){
	app.listen(process.env.PORT || port, () => console.log(`Server running at port ${process.env.PORT || port}`));
}

module.exports = {app,mongoose};