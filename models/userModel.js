const mongoose = require('mongoose');

const { Schema } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');



const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: false,
        trim: true,
        minlength: [3, 'Name {VALUE} must be atleast 3 characters'],
        maxlength: [25, 'Name {VALUE} must be atleast 25 characters'],
    },
    role: {
        type: String, 
        enum: ['admin', 'lead-guide','guide', 'user'],
        lowercase: true,
        // default: 'user'
    },
    active: {
        default: true, 
        type: Boolean,
        select: false //no one should see this
    },
    email: {
        type: String,
        required: [true, 'An email is required '],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'The email is not a valid email']
    },
    photo: {
        type: String,
        required: false,
        unique: false
    },
    password: {
        type: String,
        required: true,
        unique: false,
        minLength: [8, 'Your password must be at least 8 characters long.'],
        maxLength: [60, 'Your password must not exceed 60 characters.'],
        trim: true,
        select: false
    },
    confirmPassword: {
        type: String,
        required: true,
        unique: false,
        minLength: [8, 'Your password must be at least 8 characters long.'],
        maxLength: [60, 'Your password must not exceed 60 characters.'],
        validate: {
            validator: function (val) {
                return val === this.password;
            },
            message: "Passwords do not match!"
        },
        select: false
    },
    passwordChangedAt: {
        type: Date,
    },

    passwordResetToken: String,
    passwordResetExpiryTime: Date


}, { autoIndex: true, versionKey: false });



// userSchema.set('toJSON', {
//     versionKey: false
// })


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined; // deletes this field and doesnt save in the database
    next()
});




//? ONLY FETCH THE ACTIVE ACCOUNTS FROM DB
userSchema.pre(/^find/, function (next){
    // show documents that have active: true
    this.where({active: {$ne: false}})
    next()
})
userSchema.methods.passChngAftToken = function (jwtPayload) {
   return !!(this.passwordChangedAt && this.passwordChangedAt * 1000 < jwtPayload.iat)
};

// trying out instance method
userSchema.methods.isThisPasswordCorrect = async function (candidatePassword, hashedPassword) {
    try {
        return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
        console.log('inside isThisPasswordCorrect err block ')
        if(error) throw new Error(error)
    }
};

//creating reset token for forgot password
userSchema.methods.createPasswordResetToken = async function (){
try {
    
    //generating that token
    const resetToken = crypto.randomBytes(32).toString('hex')
    console.log({resetToken},"this.passwordResetToken: ", this.passwordResetToken);
    
    // we will send this token to the user 
    // will be stored in db for security,
    //  so that no hacker can use the stolen acc
    //? for token string
    this.passwordResetToken = crypto.createHash('sha-256').update(resetToken).digest('hex') //will save this to DB now (hashed token)
    // this.passwordResetToken = resetToken
    //? for expiry time
    this.passwordResetExpiryTime = Date.now() + 10 * 60 * 1000
    return resetToken
} catch (error) {
    console.log('error inside createPasswordResetToken: ', error)
}
}


const User = mongoose.model('User', userSchema);

module.exports = User;