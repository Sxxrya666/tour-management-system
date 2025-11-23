
const AppError = require("../utils/AppError");

const handleCastErrorMongoDB = (err) => {
  const errorMsg = `Invalid ${err.path} value: ${err.value}. Please provide a valid ObjectId.`;
  const newError = new AppError()
  newError.message = errorMsg
  newError.isOperational = true
  newError.status = 'fail'
  newError.statusCode = 400
  return newError
};

const handleJWTErrorMongoDB = () => {
  const invalidSignature = 'Token Signture Invalid, Please try again!'
  const newError = new AppError()
  newError.message = invalidSignature
  newError.isOperational = true
  newError.status = 'fail'
  newError.statusCode = 401
  return newError
}

const handleTokenExpiryError = () =>{
  const message = 'Token Expired. Logging out!'
  const newError = new AppError()
  newError.message = message 
  newError.isOperational = true
  newError.status = 'fail'
  newError.statusCode = 401
  return newError
}

const handleDuplicateKeyError = (err) => {
  const message = 'User already exists using this email! Please try again.' 
  const newError = new AppError(); 
  newError.message = message; 
  newError.isOperational = true
  newError.status = 'Fail'; 
  newError.statusCode = 409; 
  return newError;  
}

const sendDevelopmentErrors = (err, res) => {
  return res.status(err.statusCode).json({
    error_name: err.name,
    error_msg: err.message, 
    err_path: err.path,
    error: err,
    error_address: err.address,
    error_code: err.code,
    error_cause: err.cause,
    error_stack: err.stack,
    error_issues: err.message.issues
  });
};
const sendProductionErrors = (err, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
    res.status(err.statusCode).json({
      message: err.message,
      status: err.status
    });
};

//! MAIN MIDDLEWARE
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  

  function handleDBerrorTypes(err){
    let error = err 

    if (error.name === 'CastError') {
      error = handleCastErrorMongoDB(error)
    }
    else if(error.name === 'JsonWebTokenError' && error.message === 'jwt malformed'){
      error = handleJWTErrorMongoDB();
    }
    else if(error.name === 'TokenExpiredError'){
      error = handleTokenExpiryError();
    }
    else if(error.message.includes("duplicate key") && error.code === 11000){
      error = handleDuplicateKeyError(err); 
    }
    return error 
  }
  if (process.env.NODE_ENV === "development") { 
    console.log('Firing Development Error Handler!')
    let errorType = handleDBerrorTypes(err); 
    sendDevelopmentErrors(errorType, res);

  } else if (process.env.NODE_ENV === "production") {
    console.log('Firing Development Error Handler!')
      let errorType = handleDBerrorTypes(err); 
      sendProductionErrors(errorType, res); 
    }

  next(err); 
};
