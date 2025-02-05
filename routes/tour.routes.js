const express = require("express");
//route handlers
const {
	top5cheap,
	getAllTour,
	getSpecificTour,
	createNewTour,
	updateNewTour,
	deleteTour,
	getTourStats,
	getMonthlyPlan,
fetchTourWithinRadius
} = require("../controllers/tour.controller");

//import auth controller for middleware
const { protect, restrictTo } = require("../controllers/auth.controller");
const {setUserAndTourIDs, createReview, getAllReviews, getSpecificTourReviews} = require("../controllers/review.controller"); //createReview is child route
const router = express.Router({mergeParams: true});


router.use((req, res, next)=>{
	console.log('req.baseUrl',req.baseUrl )
	next()
})


router
    .route("/")
    .get(getAllTour)
    .post(createNewTour)


router.use(protect) //? PROTECTING ROUTES FOR ALL BELOWWW CONTROLLERS
// routing in parent route
router.route("/:tourId/reviews")
.post(restrictTo('user'), setUserAndTourIDs, createReview)
.get(restrictTo('user'), getSpecificTourReviews)

//? special route for GEOSPATIAL QUERY
router.route('/tour-within-radius/distance/:distance/position/:lonlat/unit/:unit').get(fetchTourWithinRadius)

router.route("/tour-stats").get(restrictTo('admin'), getTourStats) //aggregation pipeline
router.route("/get-monthly/:year").get(getMonthlyPlan); //aggregation pipeline
router.route("/cheapest-top-5").get(top5cheap,  getAllTour); //making a middleware aliasing with new route


router
	.route("/:id")
	.get(getSpecificTour)
	.patch(restrictTo('admin', 'lead-guide'), updateNewTour)
	.delete(restrictTo('admin', 'lead-guide'), deleteTour)

module.exports = router;


