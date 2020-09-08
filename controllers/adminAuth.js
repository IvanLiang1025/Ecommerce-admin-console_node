

const User = require("../models/user");
const errorHandler = require("../helpers/dbErrorHandler");
// for generating token
const jwt = require("jsonwebtoken");
// for authorizing token
const expressJwt = require("express-jwt");

function signUp(req, res) {

  const user = new User(req.body);
  user.save((error, user) => {
    if (error) {
      return res.status(400).json({
        error: errorHandler(error)
      })
    }
    res.json({
      user
    });
  })
}


// function isAuth(req, res, next) {

//   let userId = req.auth && req.auth._id;
//   if (!userId) {
//     return res.status(403).json({
//       error: "Sorry, you are not authorized to access"
//     })
//   }
//   next();
// }

function isAdmin(req, res, next) {

  const { originalUrl } = req;
  // console.log(originalUrl);
  if (originalUrl === '/api/admin/signin') {
    // next()
  } else {
    let userRole = req.auth && req.auth.role;
    if (userRole !== 1) {
      return res.status(403).json({
        
      })
    }
  }
  next();
}






// ivan 20200504 new auth-related
function adminSignIn(req, res) {
  const { email, password } = req.body;
  // console.log(res);
  User.findOne({ email: email }, (err, user) => {
    if (err || !user) {
      return res.json({
        status: 1,
        message: "User with the email does not exist"
        // error: "User with the email does not exist",
      })
    }
    if (!user.authorizePassword(password)) {
      return res.json({
        status: 1,
        message: "Email and password do not match"
        // error: "email and password do not match"
      })
    }

    //generate jwt token
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);

    // persist the token in cookie as "token" with expiry date
    res.cookie("token", token, { expire: Date.now() + 10000 });
    // return response with token and user to frontend client
    const { _id, name, email, role } = user;
    return res.json({ 
      status: 0,
      data: {token, user: { _id, name, email, role }}
     });
  })
}

function adminSignOut(req, res) {
  res.clearCookie("token");
  res.json({
    status: 0,
    data: {}
  })
}


module.exports = {

  // ivan 20200504
  adminSignIn,
  adminSignOut,
  // isAuth,
  isAdmin,
}