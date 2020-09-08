

const express = require("express");
const adminRouter = express.Router();
// const userController = require("../controllers/user");
const adminAuthController = require("../controllers/adminAuth");
const productController = require("../controllers/adminProduct");
const userController = require("../controllers/adminUser");
const orderController = require("../controllers/adminOrder");
const categoryController = require("../controllers/adminCategory");
const statisticsController = require("../controllers/adminStatistics");
// const userValidator = require("../validator/uservalidator");
const jwtAuth = require('../interceptor/auth');


// ivan 20200904 try using new methods of verify tokens
adminRouter.use(jwtAuth, adminAuthController.isAdmin)
// adminRouter.use()

adminRouter.post("/signin", adminAuthController.adminSignIn);
adminRouter.post("/signout", adminAuthController.adminSignOut);


// user-related 
adminRouter.get("/users", userController.getAllUsers);
adminRouter.post("/user", userController.addUpdateUser);
adminRouter.delete("/user", userController.deleteUser);

// order-related
adminRouter.get("/orders", orderController.getAllOrders);
adminRouter.get("/order/statuslist", orderController.getStatusValues);
// update order status
adminRouter.post("/order/status", orderController.updateOrderStatus);

// category-related
adminRouter.get("/categories", categoryController.getAllCategory);
adminRouter.post("/category", categoryController.addUpdateCategory);
adminRouter.delete("/category", categoryController.deleteCategory);

// product-related
adminRouter.get("/products", productController.getAllProducts);
adminRouter.post("/product", productController.addUpdateProduct);
adminRouter.delete("/product", productController.deleteProduct);

// statistic-related
adminRouter.get("/statistics/orders", statisticsController.getOrderStatistics);



module.exports = adminRouter;
