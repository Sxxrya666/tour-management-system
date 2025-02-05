
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
  const invalidSignxture = 'Token Signture Invalid, Please try again!'
  const newError = new AppError()
  newError.message = invalidSignxture
  newError.isOperational = true
  newError.status = 'fail'
  newError.statusCode = 401
  return newError
}

const handleTokenExpiryError = () =>{
  const expToken = 'Token Expired. Logging out!'
  const newError = new AppError()
  newError.message = expToken
  newError.isOperational = true
  newError.status = 'fail'
  newError.statusCode = 401
  return newError
}


const sendDevelopmentErrors = (err, res) => {
  res.status(err.statusCode).json({
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
  // if (err.isOperational) {
  //   res.status(err.statusCode).json({
  //     message: err.message,
  //     status: err.status
  //   });
  // } else {
  //   console.error('Error from non-opertionl section: ', err);
  //   res.status(500).json({
  //     message: 'something went very wrong',
  //     status: 'fail'
  //   });
  // }
};

//! MAIN MIDDLEWARE
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // SENDING ERROR MSGES ACC TO DEV ENV
  if (process.env.NODE_ENV === 'development') {
    console.log('executing sendDevelopmentErrors()')
    sendDevelopmentErrors(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err // *avoiding direct mutation (shallow copy)
    
    if (error.name === 'CastError') {
      error = handleCastErrorMongoDB(error)
    }
    else if(error.name === 'JsonWebTokenError' && error.message === 'jwt malformed'){
      error = handleJWTErrorMongoDB();
    }
    else if(error.name === 'TokenExpiredError'){
      error = handleTokenExpiryError();
    }

    console.log('executing sendDevelopmentErrors()')
    sendProductionErrors(error, res);
  }
  next(err); // Forward the error to the next middleware
};
