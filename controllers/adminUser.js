
const User = require("../models/user");
const { Order } = require("../models/order");
const errorHandler = require("../helpers/dbErrorHandler");

// function findUserById(req, res, next, id) {
//   User.findOne({ _id: id })
//     .exec((err, user) => {
//       if (err || !user) {
//         return res.status(400).json({
//           error: "user not found"
//         })
//       }
//       req.userProfile = user;
//       next();
//     })
// }

// function findUserProfile(req, res) {
//   req.userProfile.password = undefined;
//   return res.json(req.userProfile);
// }



// function addOrderToUserHistory(req, res, next) {
//   let history = [];
//   let order = req.body.order;
//   for (let product of order.products) {
//     history.push({
//       _id: product._id,
//       name: product.name,
//       category: product.category,
//       price: product.price,
//       count: product.count,
//       transactionId: order.transactionId,
//       amount: order.amount
//     })
//   }
//   User.findOneAndUpdate(
//     { _id: req.userProfile._id },
//     { $push: { history: history } },
//     { new: true }
//   )
//     .exec()
//     .then(result => {
//       next()
//     })
//     .catch(err => {
//       return res.status(400).json({
//         error: "Could not update user purchase history"
//       })
//     })
// }

// function findOrderByUserId(req, res) {

//   const sortBy = "updatedAt";
//   const order = "desc";

//   Order.find({ user: req.userProfile._id })
//     .sort([[sortBy, order]])
//     .exec()
//     .then(result => {
//       res.json(result);
//     })
//     .catch(err => {
//       return res.status(400).json({
//         error: errorHandler(err)
//       })
//     })
// }


// ivan 20200503 refactor 
function deleteUser(req, res) {
  console.log(req.body);
  const { userId } = req.body;
  User.deleteOne({ _id: userId })
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

/**
 * get the list of users with query param limit, skip 
 */
function getAllUsers(req, res) {
  console.log(req.query);
  let {limit: lim, page} = req.query;
  const order = "desc";
  const sortBy = "createdAt";
  const limit = (lim && parseInt(lim)) || 6;
  const skip = (page && parseInt(page)) || 1;
  // console.log(skip)
  // console.log(limit)

  User.countDocuments()
    .exec((err, count) => {
      // console.log(err)
      if (err) {
        res.status(500).json({});
        return;
      } else {
        User.find()
          .sort([[sortBy, order]])
          .skip((skip-1) * limit)
          .limit(limit)
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

// create a user or update user info when request with userId
function addUpdateUser (req,res) {
  const { userId } = req.body;
  // console.log(req.body);
  if (userId) {
    User.findOneAndUpdate({ _id: userId },
      req.body,
      { new: true },
    )
      .exec()
      .then(user => {
        // user.password = undefined;
        return res.json({ status: 0, data: {} });
      })
      .catch(err => {
        return res.status(500).json({})
      })
  } else {
    const user = new User(req.body);
    user.save((error, user) => {
      if (error) {
        return res.status(500).json({})
      }
      res.json({
        status: 0,
        data: {}
      });
    })
  }
}

module.exports = {
  // findUserById,
  // findUserProfile,
  // addOrderToUserHistory,
  // findOrderByUserId,
  
  // ivan 20200506
  getAllUsers,
  addUpdateUser,
  deleteUser,
}

