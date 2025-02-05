const express = require('express')
const router =  express.Router({mergeParams: true})

const {protect} = require("../controllers/auth.controller")
const {setUserAndTourIDs, createReview, getAllReviews, updateReview, deleteReviews} = require('../controllers/review.controller')


router.route('/').post(createReview)
.get(protect,getAllReviews)

router.route('/:id').patch(updateReview).delete(deleteReviews)
module.exports = router