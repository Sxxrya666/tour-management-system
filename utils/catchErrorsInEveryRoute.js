
//higher order functions for error handling

const catchErrorsInEveryRoute = (handler)=>{

	return (req, res, next) => {
		Promise.resolve(handler(req, res, next)).catch(next)
	}
}

	//* either this code
	// return async (req,res,next)=>{
	// 	try {
	// 		await mainFunction(req,res,next)
	// 	} catch (error) {
	// 		next(error)
	// 	}

	// //? or this works equally: 
	// return async (req, res, next)=>{
	// 	await mainFunction(req, res, next)
	// }



module.exports = catchErrorsInEveryRoute