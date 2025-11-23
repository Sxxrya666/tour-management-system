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

const YAML = require('yaml')
const fs = require('fs')
const swaggerUi = require('swagger-ui-express')
const apiDocs = fs.readFileSync('./utils/data/apiDocs.yaml', 'utf-8' ) 
const apiDocsParsed  = YAML.parse(apiDocs)

const app = express();

console.log("\x1b[21mENVIRONMENT\x1b[0m:", `\x1b[44m${process.env.NODE_ENV}\x1b[0m`)

app.use(compression())
app.use(cookieParser(process.env.COOKIE_SECRET)); //signed
app.use(helmet()) 
app.use(mongoSanitize()) 
app.use(hpp())
app.use(limiter()) 
app.use(express.json({limit: '10kb'}));
app.disable("x-powered-by")

app.get("/", (req, res)=>{
  res.json({
    message:"Welcome to Yatrify! Your robust touring system for any adventurous saga"
  })
})

app.get("/health", (req, res)=>{
  res.json({
    status: "healthy",
  })
})


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use("/api/v1/reviews",reviewRouter);


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
    const options = {explorer: true , swaggerOptions: {tryItOutEnabled: true}}
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiDocsParsed, options))
}

app.all('*', (req, res, next) => {
   next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404)); 
});

app.use(globalErrorHandler);
module.exports = app;