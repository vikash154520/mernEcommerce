const ErrorHandler = require("../utils/errorHandler")

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong mongodb Id Error
    if(err.name === "CastError"){
        const message=`Resource Not Found. Invalid:${err.path}`;
        err = new ErrorHandler(message,400);
    }

    // Mongoose dublicate key error
    if(err.code === 11000){
        const message = `Duplicate ${object.key(err.keyValue)} Enter`;
        err = new ErrorHandler(message,400);
    }

    // Wrong JWT error
    if(err.name === "JsonWebTokenError"){
        const message=`Json web token is invailid. Try again`;
        err = new ErrorHandler(message,400);
    }

    // Wrong JWT error
    if(err.name === "TokenExpiredError"){
        const message=`Json web token is Expired. Try again`;
        err = new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
}