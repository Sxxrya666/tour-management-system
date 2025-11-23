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
    jwtToken: {
        type: String, 
    },
    passwordResetToken: {
       type: String
    },
    passwordResetExpiryTime: {
        type: Date
    }

}, { autoIndex: true, versionKey: false });

userSchema.set('toJSON', {
    versionKey: false
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    
    if (!this.isNew) {
        // evicting a race condition between db write and token creation time 
      this.passwordChangedAt = Date.now() - 1000; 
    }

    this.confirmPassword = undefined; 
    next()
});

/**
 * ONLY FETCH THE ACTIVE ACCOUNTS FROM DB
 * */
userSchema.pre(/^find/, function (next){
    this.where({active: {$eq: true}})
    next()
})

/**
 *  RETURNS TRUE if the token is older (INVALID/BAD)
 *  RETURNS FALSE if the token is newer (VALID/GOOD)
 */
userSchema.methods.passChngAftToken = function (jwtTimestamp) {
     if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return jwtTimestamp < changedTimestamp;
    } else {
        return false 
    }
}    

userSchema.methods.isThisPasswordCorrect = async function (candidatePassword, hashedPassword) {
    const result =  await bcrypt.compare(candidatePassword, hashedPassword);
    return result
};

/**
 * creating reset token for forgot password
 * - generate a random secure token using crypto library
 * - we will save this token to the database for security
 * - then set an expiry time for that so that it is short-lived
 */
userSchema.methods.createPasswordResetToken = async function (){
try {
    
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // hashing the token    
    this.passwordResetToken = crypto.createHash('sha-256').update(resetToken).digest('hex') 
    this.passwordResetExpiryTime = Date.now() + 15 * 60 * 1000
    return resetToken
} catch (error) {
    console.log('error inside createPasswordResetToken: ', error)
    }
}

const User = mongoose.model('User', userSchema);
module.exports = User;