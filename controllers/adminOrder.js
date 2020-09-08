

const { Order } = require("../models/order");
const errorHandler = require("../helpers/dbErrorHandler");


function findOrderById(req, res, next, id) {
  Order.findById(id)
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        })
      }
      if (!order) {
        return res.status(400).json({
          error: "Could not find order with the id"
        })
      }
      req.order = order;
      next()
    })
}


// ivan 20200506 refactor
function getAllOrders(req, res) {
  let { limit, page } = req.query;
  const order = "desc";
  const sortBy = "createdAt";
  // const limit = (lim && parseInt(lim)) || 6;
  // const skip = (page && parseInt(page)) || 1;

  if (!limit || !page) {
    Order.find()
      .sort([[sortBy, order]])
      .exec((err, orders) => {
        if (err) {
          res.status(500).json({});
          return;
        }
        res.json({
          status: 0,
          list: orders,
          total: orders.length
        });
      })
    return;
  }

  const lim = parseInt(limit);
  const skip = parseInt(page)

  Order.countDocuments()
    .exec((err, count) => {
      // console.log(err)
      if (err) {
        res.status(500).json({});
        return;
      } else {
        Order.find()
          .populate("user")
          .sort([[sortBy, order]])
          .skip((skip - 1) * lim)
          .limit(lim)
          .exec((err, orders) => {
            // console.log(err);
            if (err) {
              res.status(500).json({});
              return;
            }
            // console.log(users);
            res.json({
              status: 0,
              list: orders,
              total: count
            });
          })
      }
    })
}

function getStatusValues(req, res,) {
  res.json({
    status: 0,
    data: Order.schema.path("status").enumValues
  })
}


function updateOrderStatus(req, res) {
  const { orderId, status } = req.body;

  if(!orderId || !status){
    return res.status(400).json({})
  }

  Order.findOneAndUpdate({ _id: orderId }, { status }, { new: true })
    .then(result => {
      res.json({
        status: 0,
        data: {}
      })
    })
    .catch(err => {
      return res.status(500).json({})
    })
}

module.exports = {
  
  findOrderById,
  // ivan 20200506
  getAllOrders,
  getStatusValues,
  updateOrderStatus,

}