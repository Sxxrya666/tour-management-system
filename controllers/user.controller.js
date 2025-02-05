const User = require('../models/userModel')
const catchErrorsInEveryRoute = require('../utils/catchErrorsInEveryRoute');
const AppError = require('../utils/AppError');
const factory = require("./factoryCreate")


const getAllusers = factory.getAll(User)
const getSpecificUser = factory.getOne(User) 

//? MIDDLEWARE TO CHECK USER'S CURRENTLY LOGGED IN DETAIL
const getMyDetailsWithoutID = (req, res, next) => {
  req.params.id = req.user.id
  next()
}



const updateMe = catchErrorsInEveryRoute (async(req, res, next)=>{

  //! ensuring no keys are tampered( filter out the keys to edit)
  const filteredReqBody = ( obj, ...allowedFields )=>{
    const finalObj ={}
    Object.keys(obj).forEach(key=>{
      if(allowedFields.includes(key)){
        finalObj[key] = obj[key]
      }
    })
    return finalObj
  }

  const options = {new: true, runValidators: true}
  //get userID from db
  const user = await Users.findByIdAndUpdate(req.user.id, filteredReqBody(req.body, 'name','email'), options)



  // send the entire object
  res.status(202).json({
    status: 'success',
    updatedUserObj: {
      user
    },
    position: 'updateMe'
  })
})

// we will NOT delete the user Acc, instead `deactivate` it
//creating a schema in model named 'active' and tamper with it 
const deleteMe = catchErrorsInEveryRoute( async(req, res, next)=>{

  const result = await User.findOneAndUpdate({_id: req.user.id},{active: false}, {new: true})

    console.log('Update Result:', result);
  // if(!user.id) return()
  res.status(204).json({
    status: 'success',
    message: 'the Account has been deleted',

  })
})


const createNewUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route is not yet defined",
  });
};

const updateUser = factory.updateOne(User)
const deleteUser = factory.deleteOne(User)

module.exports = {
  getMyDetailsWithoutID,
  getAllusers,
  updateMe,
  deleteMe,
  getSpecificUser,
  createNewUser,
  updateUser,
  deleteUser,
};
