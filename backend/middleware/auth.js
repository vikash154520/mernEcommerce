const req = require("express/lib/request");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Check login or NOT
exports.isAuthenticatedUser = catchAsyncError(async (req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please Login to access this resource",401))
    }

    const decodeData = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodeData.id);

    next();
});

// Check the role
exports.authorizeRoles = (...role)=>{
    return (req,res,next)=>{
        if(!role.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} is not allowed to access this part`,404));
        }
        next();
    };
}
