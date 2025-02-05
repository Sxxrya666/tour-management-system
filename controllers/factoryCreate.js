const catchErrorsInEveryRoute = require("../utils/catchErrorsInEveryRoute");
const AppError = require("../utils/AppError");
const APIfeatures = require("../utils/APIfeatures");

//? THIS FACTORY FUNCTIONS ARE JUST LIKE CREATING TEMPLATE/SKELETON FUNCTIONS THAT RETURN ANOTHER FUNCTION 
//? ITS USEFUL FOR FORMATTING AND SIMPLIFYING THE EXISTING CONTROLLER CODES TO LOOK CLEAN AND THAT HAVE REPETITION
// 1) SO BASICALLY FIND COMMON WRITTEN FUNCTIONS AND THEN MAKE IT HAVE COMMON VARIABLES 
// 2) if there are any extra things that are not common, use them in a middlware or try something else

//* TIP: use the Model.modelName to get the model's name to dynamically send messages!!


//? for deleting 
const deleteOne = (Model) =>  catchErrorsInEveryRoute( async (req, res,next) => {

	const doc = await Model.findByIdAndDelete(req.params.id);
	console.log(`${req.params.id} document is deleted!`);


	if(!doc){
		return next(new AppError('Document ID is not available!', 404))
		}
	res.status(204).json({
		status: "success",
		data: null,
		msg: `deleted ${req.body}`,
	});
});

//? for updating 
const updateOne = (Model) => catchErrorsInEveryRoute(async (req, res, next) => {
  const options = {
    new: true,
    runValidators: true,
  };

  const document = await Model.findByIdAndUpdate(req.params.id, req.body, options);
  
  if (!document) {
    return next(new AppError(`No ${Model.modelName} found with that ID`, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      [Model.modelName.toLowerCase()]: document,
    },
  });
});

const createOneMany = Model => catchErrorsInEveryRoute (async (req, res,next) => {

		const document = await Model.create(req.body);
		console.log(document);
		res.status(201).json({
			status: "success",
			message:"Document created successfully!",
			data: {
				tour: document,
			},
		});
	
});
//? FOR GETTING ALL 
const getAll = Model => catchErrorsInEveryRoute(async (req, res, next) => {

	let obj = {}
	const tourId = req.params.tourId
	if(tourId) obj.tour = tourId
	console.log({tourId})
	const APIfeats = new APIfeatures(Model.find(obj), req.query)
		.filter()
		.sort()
		.fields()
		.paginate();
		// console.log("APIfeats: ", APIfeats);

		const doc = await APIfeats.query;
		// console.log("final tour: ", tour);


		return res.status(200).json({
			results: doc.length,
			status: "success",
			page_number: parseInt(req.query.page, 10) || 1,
			data: {
				[Model.modelName.toLowerCase() + "s"] : doc
			},
		})


});




const getOne = Model => catchErrorsInEveryRoute(async (req, res,next) => {
		const document = await Model.findById(req.params.id)
    // .populate('reviews')
    // .select('+reviews'); ====> this part is handled by pre-hook. no tension. 

		if(!document){
			return next(new AppError(`abe bhosadike ${Model.modelName} ID '${req.params.id}' is not available!`, 404))
		}

		res.status(200).json({
			status: "success",
			data:{
				document
			}
		});
	
});


module.exports= {deleteOne, updateOne, createOneMany, getAll, getOne}