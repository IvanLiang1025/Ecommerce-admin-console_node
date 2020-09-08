/**
 * ivan 20200501 
 * this interceptor is for admin router
 */
const expressJwt = require("express-jwt");
// const { secretKey } = require('../constant/constant');
// express-jwt中间件帮我们自动做了token的验证以及错误处理，所以一般情况下我们按照格式书写就没问题，其中unless放的就是你想要不检验token的api。
const jwtAuth = expressJwt({secret: process.env.JWT_SECRET, requestProperty: 'auth'})
.unless({path: ["/api/admin/signin"]}); 


module.exports = jwtAuth;
