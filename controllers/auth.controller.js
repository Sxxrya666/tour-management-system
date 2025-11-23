
const jwt = require('jsonwebtoken')
const {promisify} = require('util')
const crypto = require('crypto')
const catchEveryErrorsInAsyncCode = require('../utils/catchErrorsInEveryRoute')
const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const sendEmail = require('../utils/token.emailer');
const catchErrorsInEveryRoute = require('../utils/catchErrorsInEveryRoute');


//jwt signing 
const createToken = (id) => jwt.sign({mongoUserId: id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRY_TIME
        })


/**
 * This is a helper function for all routes that create cookies and jwt to database or update them
 * @param {object} user the entire user object
 * @param {integer} statusCode return correct status
 * @param {string} token jwt token that is created or used by endpoints
 * @param {string} message message from server
 * @param {object} res pass in response object from endpoint
 */
const createUserAndToken = (user, statusCode, token, message, res) =>{
    if(!res) {
        throw new AppError('Response object is undefined', 500);
    }
    
    const options = {
        httpOnly: true, 
        maxAge: 4 * 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRY_TIME * 60 * 1000),
        signed: true
    }
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

const signup = catchEveryErrorsInAsyncCode(async (req, res, next) => {

        const signUpDetails = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            role: req.body.role || 'user'
        })
        const token = createToken(signUpDetails._id)
        signUpDetails.password = undefined //hide the output of password 
        createUserAndToken(signUpDetails, 201, token, 'Sign Up Successful!', res)
    }
   )
const login = catchEveryErrorsInAsyncCode (async(req, res,next) => {
    const {email, password} = req.body

    //check if email and password exists
    if(!email || !password){
        return next(new AppError('Please enter an email or password', 400))
    }
    // if user exists then check password
    const user = await User.findOne({email}).select("+password")
    if(!user) return next(new AppError('User does not exist! ', 400))

    const correctDetails = await user.isThisPasswordCorrect(password, user.password)
    // check for validity now after getting all the details
    if(!correctDetails) return next(new AppError('Incorrect Email or Password! Try Again.'))

    //send back token to user if all good
    const token = createToken(user._id)
    createUserAndToken(undefined ,200, token, 'Login Successful!', res)
})

/**
 * middleware for authenticated users only
 * - get the token and check if exists
 * - check if headers exist and the token has 'Bearer' as the starting word
 * - check if token exist
 * - validate/verify it if its correct by jwt.verify()
 * - using node's promisify to make the 'createToken' function async
 * - check if the user exists (like they deleted acc or something)
 * - then check if user changed the password after jwt token was issued
 */
const protect = catchEveryErrorsInAsyncCode( async (req, res, next)=>{
    let tokenFromHeader;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
         tokenFromHeader = req.headers.authorization.split(' ')[1]
    } 

    if(!tokenFromHeader){
        return next(new AppError('No token found. Login is required to perform this action, try again', 401))
    }

    const promisifiedToken = promisify(jwt.verify)
    const decodedToken = await promisifiedToken(tokenFromHeader, process.env.JWT_SECRET)
    if(!decodedToken) return next(new AppError('Invalid token, Please login again', 401))
    
    const currentUser = await User.findById(decodedToken.mongoUserId)
    if(!currentUser){
        return next(new AppError('User belonging to the token does not exist!', 401))
    }
    const checkPassChngValidity = currentUser.passChngAftToken(decodedToken.iat)
    if(checkPassChngValidity){
        return next(new AppError('User changed the password after the token was issued', 401))
    }
    
    req.user = currentUser
    next()
})

const restrictTo = (...roles) =>  (req, res, next) => {
        const userRole = req.user.role
        console.log(userRole)
        if(!roles.includes(userRole)){
            return next(new AppError('You are not allowed to perform this action', 403))
        }
        next()
    }


/**
 * endpoint for forgot password
 * - take the email from body
 * - check for the old token by seeing if the user exist
 * - if true, create a new reset token
 * - then trigger the email mechanism
 */
const forgotPassword = catchEveryErrorsInAsyncCode(async(req, res, next)=>{
    const email = req.body.email
    const user = await User.findOne({email})
    if(!user) return next(new AppError('No email is associated with this user', 404))

    const newResetToken = await user.createPasswordResetToken()
    console.log({newResetToken})
    await user.save()

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${newResetToken}`

    const message =  `Forgot your password? 
    Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n
    If you didn't forget your password, please ignore this email!`
   try{
        const sendMail = await sendEmail({
        email: user.email,
        subject: `Reset Your Password [Expires in 5 minutes]`,
        message
    })

        createUserAndToken(user, 200, newResetToken, 'Token sent successfully to email!', res)
   } catch { 
        user.passwordResetToken = undefined
        user.passwordResetExpiryTime = undefined
        await user.save({validateBeforeSave: false})

        return next(new AppError('Error sending the mail!', 500))
    }

})

/**
 * RESET PASSWORD CONTROLLER
 * - hash and get the token from the existing token from the endpoint's parameter
 * - get the previously saved token and logged in time from database which was saved during signup 
 * - if the user is not present, then return error
 * - create a new jwt token using primary key
 * - send token back to the user 
 */
const resetPassword = catchEveryErrorsInAsyncCode(async(req, res, next) => {

    const hashedToken = crypto.createHash('sha-256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpiryTime: {
            $gt: Date.now()
        }
    })

    if(!user) return next(new AppError('Token is not valid or expired', 400))
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    if(user.password !== user.confirmPassword) return next(new AppError('Passwords do not match! Try again.', 400))

    const token = createToken(user._id)

    await user.save()

    createUserAndToken(user, 202, token, 'Password Updated using reset mechanism Successfully', res)
})

/**
 * PASSWORD UPDATION endpoint
 * - find the password from the user 
 */
const updatePassword = catchErrorsInEveryRoute(async(req, res, next)=>{

    const user = await User.findById(req.user.id).select({password: 1})
    if(!user) return next(new AppError("user not found",404))

    const isCorrect = await user.isThisPasswordCorrect(
        req.body.oldPassword,
        user.password
    );
    if (!isCorrect) return next(new AppError("Incorrect current password", 400));

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new AppError("Passwords do not match", 400));
    }
    user.password = req.body.newPassword
    user.confirmPassword = req.body.confirmPassword
    
    await user.save()

    const token = createToken(user._id)
    createUserAndToken(user, 201, token, 'Password Updated Successfully', res)

})

module.exports = {signup, login, protect, restrictTo, forgotPassword, resetPassword, updatePassword}