const catchErrorsInEveryRoute = require("../utils/catchErrorsInEveryRoute");
const AppError = require("../utils/AppError");
const APIfeatures = require("../utils/APIfeatures");

const deleteOne = Model =>  catchErrorsInEveryRoute( async (req, res,next) => {

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

const updateOne = Model => catchErrorsInEveryRoute(async (req, res, next) => {
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
		res.status(201).json({
			status: "success",
			message:"Document created successfully!",
			data: {
				tour: document,
			},
		});
	
});

const getAll = Model => catchErrorsInEveryRoute(async (req, res, next) => {

	let obj = {}
	const APIfeats = new APIfeatures(Model.find(obj), req.query)
		.filter()
		.sort()
		.fields()
		.paginate();


		const doc = await APIfeats.query;
		return res.status(200).json({
			totalCount: doc.length,
			status: "success",
			pageNumber: 1 * req.query.page || 1,
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