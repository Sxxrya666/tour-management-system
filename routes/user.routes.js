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
const {limiter} = require('../middleware/globalRateLimit')

const router = express.Router();

router.post('/auth/sign-up', limiter(10, "Too many requests for signing up. Please try later"), signup)
router.post('/auth/login', limiter(20), login)

router.use(protect) //? add middleware to protect route everything below

router.post('/forgot-password', limiter(3, "Request exhausted. Please try after a few minutes"), forgotPassword)
router.patch('/reset-password/:token', resetPassword) 
router.patch('/update-password', updatePassword)  
router.patch('/update-credentials', updateMe)
router.delete('/delete-account', deleteMe)
router.get("/me", getMyDetailsWithoutID, getSpecificUser)
/// NORMAL CRUD
router.route("/").get(getAllusers).post(createNewUser)
router.route("/:id").get(getSpecificUser).patch(updateUser).delete(deleteUser)

module.exports = router;
