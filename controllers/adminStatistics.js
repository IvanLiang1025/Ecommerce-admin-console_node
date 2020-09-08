
const { Order } = require("../models/order");
const Product = require("../models/product");



function assemblyOrderData(orders) {
  let statusArray = [
    { status: 'Not processed', value: 0 },
    { status: 'Processing', value: 0 },
    { status: 'Shipped', value: 0 },
    { status: 'Delivered', value: 0 },
    { status: 'Cancelled', value: 0 },
  ]

  orders.forEach(item => {
    statusArray.forEach(ele => {
      if (ele.status === item.status) {
        ele.value += 1
      }
    })
  });
  // console.log(statusArray);
  return statusArray;
}

function getOrderStatistics(req, res) {
  // let { limit, page } = req.query;
  const order = "desc";
  const sortBy = "createdAt";

  Order.find()
    .populate("user")
    .sort([[sortBy, order]])
    .exec((err, orders) => {
      // console.log(err);
      if (err) {
        res.status(500).json({});
        return;
      }

      const data = assemblyOrderData(orders);
      res.json({
        status: 0,
        data,
      });
    })
}



function getProductStatistics(req, res) {
  let order = req.query.order ? req.query.order : "desc";
  let sortBy = (req.query.sortBy ? req.query.sortBy : "createdAt");
  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, order]])
    .exec((err, products) => {
      // console.log(err);
      if (err) {
        res.status(500).json({});
        return;
      }
      // console.log(users);
      const data = assemblyProfuctData(products)
      res.json({
        status: 0,
        data,
      });
    })
}


module.exports = {
  getOrderStatistics,
};