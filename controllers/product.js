const Product = require('../models/Product');
const { errorHandler } = require('../auth');

//Create Product (Admin only)
module.exports.createProduct = (req, res) => {
  const newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price
  });

  newProduct.save()
    .then(product => res.status(201).send(product))
    .catch(error => errorHandler(error, req, res));
};

// Retrieve all products (Admin only)
module.exports.getAllProducts = (req, res) => {
  Product.find({})
    .then(products => res.status(200).send(products))
    .catch(error => errorHandler(error, req, res));
};

// Retrieve all active products (All)
module.exports.getActiveProducts = (req, res) => {
  Product.find({ isActive: true })
    .then(products => res.status(200).send(products))
    .catch(error => errorHandler(error, req, res));
};

// Retrieve single product (All)
module.exports.getProductById = (req, res) => {
  Product.findById(req.params.productId)
    .then(product => {
      if (product) {
        res.status(200).send(product);
      } else {
        res.status(404).send({ message: 'Product not found' });
      }
    })
    .catch(error => errorHandler(error, req, res));
};

// Update Product information (Admin only)
module.exports.updateProduct = (req, res) => {
  const updatedData = {
    name: req.body.name,
    description: req.body.description,
    price: req.body.price
  };

  Product.findByIdAndUpdate(req.params.productId, updatedData, { new: true })
    .then(product => {
      if (product) {
        res.status(200).send({ success: true, message: 'Product updated successfully' });
      } else {
        res.status(404).send({ error: 'Product not found' });
      }
    })
    .catch(error => errorHandler(error, req, res));
};

// Archive Product (Admin only)
module.exports.archiveProduct = (req, res) => {
  Product.findByIdAndUpdate(req.params.productId, { isActive: false }, { new: true })
    .then(product => {
      if (product) {
        res.status(200).send({ success: true, message: 'Product archived successfully'});
      } else {
        res.status(404).send({ error: 'Product not found' });
      }
    })
    .catch(error => errorHandler(error, req, res));
};

// Activate Product (Admin only)
module.exports.activateProduct = (req, res) => {
  Product.findById(req.params.productId)
    .then(product => {
      if (!product) {
        return res.status(404).send({ error: 'Product not found' });
      }
      if (product.isActive) {
        return res.status(200).send({
          message: 'Product already active',
          activateProduct: product
        });
      }

      product.isActive = true;
      return product.save();
    })
    .then(product => res.status(200).send({
      success: true,
      message: 'Product activated successfully'
    }))
    .catch(error => errorHandler(error, req, res));
};

// Angelo Start
// Search Products by Name
module.exports.searchProductsByName = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).send({ message: 'Product name is required' });
    }

    Product.find({ name: new RegExp(name, 'i'), isActive: true })
        .then(products => {
            if (!products.length) {
                return res.status(404).send({ message: 'No products found' });
            }
            res.status(200).send(products);
        })
        .catch(error => errorHandler(error, req, res));
};
// Angelo End

//James Start
// Search Products by Price Range
module.exports.searchByPriceRange = (req, res) => {
    const { minPrice, maxPrice } = req.body;

    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
        return res.status(400).send({ message: 'Invalid price range' });
    }

    Product.find({ price: { $gte: minPrice, $lte: maxPrice }, isActive: true })
        .then(products => res.status(200).send(products))
        .catch(error => errorHandler(error, req, res));
};
//James End
