const Tour = require("../models/tourModel");

const catchErrorsInEveryRoute = require("../utils/catchErrorsInEveryRoute");
const factory = require("./factoryCreate")

//middleware aliasing logic
const top5cheap = async (req, res, next) => {
	req.query.sort = "-ratingsAverage,price";
	req.query.limit = "5";
	req.query.fields = "name,price,ratingsAverage,summary,difficulty";
	next();
};


//route handlers start

const getAllTour = factory.getAll(Tour)
const getSpecificTour = factory.getOne(Tour)
const createNewTour = factory.createOneMany(Tour)
const updateNewTour = factory.updateOne(Tour)
const deleteTour = factory.deleteOne(Tour)

///////////////////////////////////////////////////////////////////////


// aggregation pipelines start from here
const getTourStats = catchErrorsInEveryRoute (async (req, res,next) => {

		const stats = await Tour.aggregate([
			{
				$match: { ratingsAverage: { $gte: 4.5 } },
			},
			{
				$group: {
					_id: { $toUpper: "$difficulty" },
					numberOfTours: { $sum: 1 },
					numberOfRatings: { $sum: "$ratingsCount" },
					maximumPrice: { $max: "$price" },
					minimumPrice: { $min: "$price" },
					averagePrice: { $avg: "$price" },
					avgRating: { $avg: "$ratingsAverage" },
				},
			},
			{
				$sort: { averagePrice: 1 },
			},
			// {
			// 	$match: { _id: { $ne: "EASY" } },
			// },
		]);
		// console.log(stats);

		return res.status(200).json({
			results: stats.length,
			status: "success",
			data: {
				stats,
			},
		})})

const getMonthlyPlan = catchErrorsInEveryRoute(async (req, res,next) => {
	const year = parseInt(req.params.year, 10);
	console.log(`Year: ${year}`);

	const plan = await Tour.aggregate([
		{
			$unwind: "$startDates",
		},
		{
			$match: {
				startDates: {
					$lte: new Date(`${year}-12-31`),
					$gte: new Date(`${year}-01-01`),
				},
			},
		},
		{
			$group: {
				_id: { $month: "$startDates" },
				numberOfTourInCertainMonth: { $sum: 1 },
				toursAccordingToMonth: { $push: "$name" },
			},
		},
		// {
		// 	$addFields: {
		// 		nameOfThatMonth: {
		// 			$dateToString: {
		// 				date: "$startDates",
		// 				format: "%b",
		// 			},
		// 		},
		// 	},
		// },
		{
			$sort: {
				numberOfTourInCertainMonth: 1,
			},
		},
		{
			$project: { _id: 0 },
		},
		{
			$limit: 5,
		},
	]);

	console.log("Aggregated Plan: ", plan);

	return res.status(200).json({
		results: plan.length,
		plan,
		status: "success",
	});
});


const fetchTourWithinRadius = catchErrorsInEveryRoute(async (req, res ,next)=>{


	//get all the params
	const {distance, lonlat, unit} = req.params;
	console.log(distance, lonlat, unit);

	const [lat, lon] = lonlat.split(',')

	if(!(distance && lonlat && unit)) return next(new AppError("Please specify distance, location and unit!"))

	// fetch the tours then filter with geospatial query
	 const radius = parseInt(distance, 10)/3963.2
	const query = {
		startLocation: {
			$geoWithin: {
				$centerSphere: [[parseFloat(lon),parseFloat(lat) ], radius ]
			}
		}
	}

	const tours = await Tour.find(query)
	
	
	res.status(200).json({
		results: tours.length,
		status: 'OK',
		message: "Fetched Tours within radius successfully!",
		data: {
			tours
		}
	})


})

module.exports = {
	top5cheap,
	getAllTour,
	getSpecificTour,
	createNewTour,
	updateNewTour,
	deleteTour,
	getTourStats,
	getMonthlyPlan,
	fetchTourWithinRadius
};