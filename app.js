const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')
const compression = require('compression')

const {limiter} = require('./middleware/globalRateLimit')
const tourRouter = require('./routes/tour.routes');
const userRouter = require('./routes/user.routes');
const reviewRouter = require('./routes/review.routes')
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/error.controller');

const app = express();

console.log("\x1b[21mENVIRONMENT\x1b[0m:", `\x1b[44m${process.env.NODE_ENV}\x1b[0m`)

app.use(compression())
app.use(cookieParser(process.env.COOKIE_SECRET)); //signed
app.use(helmet()) //? SET SECURITY HTTP HEADERS
app.use(mongoSanitize()) 
app.use(hpp())
app.use(limiter()) //? LIMITS THE REQUEST FROM SAME API
app.use(express.json({limit: '10kb'}));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use("/api/v1/reviews",reviewRouter);

// Start of Selection
app.all('*', (req, res, next) => {
   next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404)); 
});

app.use(globalErrorHandler);
module.exports = app;