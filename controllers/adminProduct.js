

const Product = require("../models/product");

const formidable = require("formidable");
const fs = require("fs");
const errorHandler = require("../helpers/dbErrorHandler");
const url = require("url");

function createProduct(req, res, next) {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      })
    }

    const { name, description, category, price, quantity } = fields;
    // validate if every field is filled.
    if (!name || !description || !category || !price || !quantity) {
      return res.status(400).json({
        error: "all fields are required"
      })
    }

    let product = new Product(fields);
    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "the size of photo should be less than 1Mb"
        })
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save()
      .then(result => {
        result.photo = undefined;
        res.json(result);
      })
      .catch(err => {
        return res.status(400).json({
          error: errorHandler(err)
        })
      })
  })
}

function findProductById(req, res, next, id) {
  Product.findById(id).exec((err, product) => {
    if (err || !product) {
      return res.status(400).json({
        error: "product not found"
      })
    }
    req.product = product;
    next();
  })
}

function findProduct(req, res, next) {
  req.product.photo = undefined;
  res.json(req.product);
}



/**
 * sell/ arrival
 * by sell: /products?sortBy=sold&order=desc&limit=4
 * by arrival: /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, then reponse with all products
 */

function listAllProducts(req, res) {
  let sortBy = (req.query.sortBy ? req.query.sortBy : "sold");
  let order = req.query.order ? req.query.order : "desc";

  // let limit = req.query.limit ? parseInt(req.query.limit) : 6;
  const { page, limit } = req.body;
  const limit = limit || 6;
  const skip = page || 1;

  const total = Product.find().count();

  // console.log(sortBy, order, limit);
  Product.find()
    .select("-photo")
    .populate("category")
    // .sort([[sortBy,order]])
    // ivan 20200831
    .skip(skip)
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        })
      }
      res.json({
        data: products,
        total
      });
    })
}

function listCategories(req, res) {
  Product.distinct("category", {}, (err, catogories) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      })
    }
    res.json(catogories);
  })
}


function listByFilter(req, res) {

  let order = req.body.order ? req.body.order : "desc";
  let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  console.log(order, sortBy, limit, skip, req.body.filters);


  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1]
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }
  console.log("findArgs", findArgs);

  Product.find(findArgs)
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      res.json({
        size: data.length,
        data
      });
    });
}

/**
 * list products by search
 */
function listBySearch(req, res) {

  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" }

    Product.find(query)
      .select("-photo")
      .then(result => {
        return res.json(result);
      })
      .catch(err => {
        return res.status(400).json({
          error: errorHandler(err)
        })
      })
  }
}

function loadPhoto(req, res) {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  } else {
    console.log("no photo");
    return res.json({
      message: "there is no photo for this product"
    })
  }
}

function updateQuantityAndSold(req, res, next) {
  const status = req.body.status;
  const order = req.order;
  if (status === "Shipped") {
    const bulkOps = order.products.map((product, index) => {
      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { quantity: -product.count, sold: +product.count } }
        }
      }
    })
    Product.bulkWrite(bulkOps)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        return res.status(400).json({
          error: "Could not update product quantity"
        })
      })
  }
  next()
}

// ivan 20200508
function getAllProducts(req, res) {
  // console.log(req.query);
  let order = req.query.order ? req.query.order : "desc";
  let sortBy = (req.query.sortBy ? req.query.sortBy : "createdAt");
  const { page, limit } = req.query;
  // const limit = (lim && parseInt(lim)) || 6;
  // const skip = (page && parseInt(page)) || 1;

  if (!limit || !page) {
    Product.find()
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .exec((err, products) => {
        if (err) {
          res.status(500).json({});
          return;
        }
        res.json({
          status: 0,
          list: products,
          total: products.length
        });
      })
    return;
  }

  const lim = parseInt(limit);
  const skip = parseInt(page);

  Product.countDocuments()
    .exec((err, count) => {
      // console.log(err)
      if (err) {
        res.status(500).json({});
        return;
      } else {
        Product.find()
          .select("-photo")
          .populate("category")
          .sort([[sortBy, order]])
          .skip((skip - 1) * lim)
          .limit(lim)
          .exec((err, users) => {
            // console.log(err);
            if (err) {
              res.status(500).json({});
              return;
            }
            // console.log(users);
            res.json({
              status: 0,
              list: users,
              total: count
            });
          })
      }
    })
}

function addUpdateProduct(req, res) {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded"
      })
    }

    const { name, description, category, price, quantity, productId } = fields;
    // validate if every field is filled.
    if (!name || !description || !category || !price || !quantity) {
      return res.status(400).json({
        error: "all fields are required"
      })
    }
    // console.log(productId);

    let product = { name, description, category, price, quantity, photo: {} };
    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "the size of photo should be less than 1Mb"
        })
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    // console.log(product);

    if (productId) {
      Product.findOneAndUpdate({ _id: productId },
        product,
        { new: true },
      )
        .exec()
        .then(result => {
          return res.json({ status: 0, data: {} });
        })
        .catch(err => {
          return res.status(500).json({})
        })
    } else {
      // const pro = new Product(product);
      // pro
      new Product(product).save((error, result) => {
        if (error) {
          return res.status(500).json({})
        }
        res.json({
          status: 0,
          data: {}
        });
      })
    }
  })
}

function deleteProduct(req, res, next) {
  const { productId } = req.body;
  console.log(req.body)
  if (!productId) {
    return res.status(400).json({});
  }

  Product.deleteOne({ _id: productId })
    .exec((err, result) => {
      if (err) {
        return res.status(500).json({})
      }
      res.json({
        status: 0,
        data: {}
      });
    })
}

module.exports = {
  createProduct,
  findProductById,
  findProduct,

  listAllProducts,
  listCategories,
  listByFilter,
  listBySearch,
  loadPhoto,
  updateQuantityAndSold,

  // ivan 20200508
  getAllProducts,
  addUpdateProduct,
  deleteProduct,
}