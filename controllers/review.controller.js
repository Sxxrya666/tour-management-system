const Review = require("../models/reviewModel")
const AppError = require("../utils/AppError")
const catchErrorsInEveryRoute = require("../utils/catchErrorsInEveryRoute.js")
const factory = require('./factoryCreate.js')

//? MIDDLWARE for formatting the createReview to have common create operation
const setUserAndTourIDs = (req,res, next) => {
const { rating, review } = req.body;
    const tour = req.params.tourId
    const reviewer = req.user.id
    //? now passing variables to the createFn by setting body values: 
    req.body.tour = tour
    req.body.review = review
    req.body.rating = rating
    req.body.reviewer = reviewer
    console.log({tour, reviewer})
    next()
}
//nested route part
const createReview = factory.createOneMany(Review)


// getting the review 
const getAllReviews = factory.getAll(Review)
const getSpecificTourReviews  =  factory.getAll(Review)
const updateReview = factory.updateOne(Review)
const deleteReviews = factory.deleteOne(Review)

module.exports = {setUserAndTourIDs, createReview, getAllReviews, getSpecificTourReviews,updateReview, deleteReviews};
