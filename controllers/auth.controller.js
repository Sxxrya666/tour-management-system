
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const crypto = require('crypto')
const catchEveryErrorsInAsyncCode = require('../utils/catchErrorsInEveryRoute')
const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const sendEmail = require('../utils/token.emailer');
const catchErrorsInEveryRoute = require('../utils/catchErrorsInEveryRoute');
const {roleBasedLimit} = require('../middleware/globalRateLimit')
const { log } = require('console')
//jwt signing 
const createToken = (id) => jwt.sign({mongoUserId: id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRY_TIME
        })

const createUserAndToken = (user, statusCode, token, message, res) =>{
// console.log('\x1b[42m Inside createUserAndToken fn \x1b[0m ')
//     console.log('1.) user:', user);
//     console.log('2.) statusCode:', statusCode);
//     console.log('3.) token:', token);
//     console.log('4.) message:', message);
    
    if(!res) {
        console.log('5.) res:', res);
        throw new AppError('Response object is undefined', 500);
    }
    
    const options = {
        httpOnly: true, 
        maxAge: 4 * 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY_TIME * 60 * 1000),
        signed: true
    }
    // console.log({options })
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.cookie('jwt', token, options)

    res.status(statusCode).json({
        message,
        user,
        token
    })
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 
const signup = catchEveryErrorsInAsyncCode(async (req, res, next) => {

        const signUpDetails = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            role: req.body.role || 'user'
            // passwordChangedAt: req.body.passwordChangedAt
        })
        // console.log(signUpDetails)
        //creating a jwt token / or signing.
        const token = createToken(signUpDetails._id)
        signUpDetails.password = undefined //hide the output of password 
        createUserAndToken(signUpDetails, 201, token, 'Sign Up Successful!', res)
    }
   )
const login = catchEveryErrorsInAsyncCode (async(req, res,next) => {
    console.log('inside login func: ')
    const {email, password} = req.body

    //check if email and password exists
    if(!email || !password){
        return next(new AppError('Please enter an email or password', 400))
    }
    // if user exists then check password
    const user = await User.findOne({email}).select({password: 1})
    if(!user) return next(new AppError('User does not exist! ', 400))
    // console.log(user)

    const correctDetails = await user.isThisPasswordCorrect(req.body.password, user.password)
    // console.log({correctDetails})
    // check for validity now after getting all the details
    if(!user || !correctDetails) return next(new AppError('Incorrect Email or Password! Try Again.'))

    //send back token to user if all good
    const token = createToken(user._id)
    createUserAndToken(undefined ,200, token, 'Login Successful!', res)
})
// for protected routes (making middleware for accessing tours)
const protect = catchEveryErrorsInAsyncCode( async (req, res, next)=>{
    let tokenFromHeader;
    //? 1) get the token and check if exists
    // check if headers exist and the token has 'Bearer' as the starting word
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         tokenFromHeader = req.headers.authorization.split(' ')[1]
        console.log('tokenFromHeader:', tokenFromHeader)
    }
    //check if token exist
    if(!tokenFromHeader){
        return next(new AppError('No token found. Login is unsuccessful, try again', 401))
    }

    //? 2) validate/verify it if its correct by jwt.verify()

    //using node's promisify to make the 'createToken' function async
    const promisifiedToken = promisify(jwt.verify)
    let decodedToken;

    try {
        decodedToken = await promisifiedToken(tokenFromHeader, process.env.JWT_SECRET)
    console.log("decodedToken: ", decodedToken)
    } catch (error) {
        return next(new AppError('Invalid token, Please login again', 401))
    }

    
    //? 3) then check if the user exists (like they deleted acc or something)
    const currentUser = await User.findById(decodedToken.mongoUserId)
    if(!currentUser){
        return next(new AppError('User belonging to the token does not exist!', 401))
    }
    //? 4) then check if user changed the password after jwt token was issued
    if(currentUser.passChngAftToken(decodedToken.iat)){
        return next(new AppError('User changed the password after jwt token was issued', 401))
    }
    
    // if all correct, then only call next
    
    req.user = currentUser
    // roleBasedLimit()(req, res, next);
    // createUserAndToken(currentUser, 200, tokenFromHeader, 'Authentication Successful', res);
    next()
    // console.log('REQ.USER:',req.user,{currentUser})
})
// just middleware to authorize for performing actions
const restrictTo = (...roles) =>  (req, res, next) => {
        console.log('inside restrictTo middleware')
        const userRole = req.user.role
        console.log(userRole)
        if(!roles.includes(userRole)){
            return next(new AppError('You are not allowed to perform this action', 403))
        }
        next()
    }


//!forgot password
const forgotPassword = catchEveryErrorsInAsyncCode(async(req, res, next)=>{

    //TODO: 1) input the email from body
    const email = req.body.email
    console.log({email})
    
    //TODO:  2) check for the old token by seeign if the user exist
    const user = await User.findOne({email})
    // console.log({user})
    if(!user) return next(new AppError('No email is associated with this user', 404))
    //TODO:  if true, create a new reset token
    const newResetToken = await user.createPasswordResetToken()

    await user.save()
    // console.log({newResetToken})

    //TODO: 4) then send the email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/forgot-password/${newResetToken}`
    console.log({resetUrl})
    const message =  `Forgot your password? 
    Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n
    If you didn't forget your password, please ignore this email!`


    try {
    //? SENDING THE MAIL
    await sendEmail({
        email: user.email,
        subject: `Reset Your Password [Expires in 5 minutes]`,
        message
    })
     console.log('Email sent successfully!');
        createUserAndToken(user, 200, 'Token sent successfully to email!', newResetToken, res)
    } catch (error) {
        console.error('error inside forgotPassword:', error)
        user.passwordResetExpiryTime = undefined
        user.passwordResetToken = undefined
        await user.save({validateBeforeSave: false})

        return next(new AppError('Error sending the mail!', 500))
    }

})


const resetPassword = catchEveryErrorsInAsyncCode(async(req, res, next) => {

    //hash and get the id from url 
    const hashedToken = crypto.createHash('sha-256').update(req.params.token).digest('hex')
    console.log(hashedToken)

    //GET USER OBJECT FIRST 
    const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpiryTime: {$gt: Date.now()}})
    //check if user and token time validity from DB
    if(!user) return next(new AppError('Token is not valid or expired', 400))
    
    //take password from user and set it
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    if(user.password !== user.confirmPassword) return next(new AppError('Passwords do not match! Try again.', 400))

        //! BIG FLAW: ENSURE THE USER GETS RATE LIMITED TO ONLY ONE RESET LINK AND NOT GENERATE MULTIPLE LINKS

    //send back the token to the user:
    const token = createToken(user._id)
    createUserAndToken(user, 202, token, 'Password Created Successfully', res)
})

const updatePassword = catchErrorsInEveryRoute(async(req, res, next)=>{

    //TODO get the user from collection
    const user = await User.findById(req.user.id).select({password: 1})
    if(!user) return next(new AppError("user not found",404))

    //TODO const realUntokenizedPass = promisify(jwt.decode)
    const realPass = jwt.decode(user.password, process.env.JWT_SECRET)
    console.log('real password is: ',realPass )
    console.log({user})

    //TODO take inp from user and check if existing password in databse is correct
    if(!(await user.isThisPasswordCorrect(req.body.currentPassword, user.password ))) return next(new AppError('Incorrect current password', 400)) 

    //TODO update the password
    //ask newpass and then confirm the pass
    user.password = req.body.newPassword
    user.confirmPassword = req.body.confirmPassword
    if(!user.password && !user.confirmPassword) return next(new AppError('passwords do not match'))
    
        //TODO save it to DB
    await user.save()

    const token = createToken(user._id)
    createUserAndToken(user, 201, token, 'Password Updated Successfully', res)

})




module.exports = {signup, login, protect, restrictTo, forgotPassword, resetPassword, updatePassword}