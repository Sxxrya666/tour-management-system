const express = require("express");
const {
  getAllusers,
  getMyDetailsWithoutID,
  updateMe,
  deleteMe,
  getSpecificUser,
  createNewUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const {signup, login, protect, forgotPassword, resetPassword, updatePassword} = require("../controllers/auth.controller");


const router = express.Router();



/// AUTH CRUD
router.post('/signup', signup)
router.post('/login', login)

router.use(protect) //? add middleware to protect route everything below

router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword) 
router.patch('/update-password', updatePassword)  
router.patch('/update-credentials', updateMe)
router.delete('/delete-account', deleteMe)
router.get("/me", getMyDetailsWithoutID, getSpecificUser)
/// NORMAL CRUD
router.route("/").get(getAllusers).post(createNewUser)
router.route("/:id").get(getSpecificUser).patch(updateUser).delete(deleteUser)


module.exports = router;
