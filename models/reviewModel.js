const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
	{
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		createdAt: {
			type: Date,
			default: Date.now(),
		},
		review: {
			type: String,
			required: [true, "Review field cannot be empty"],
		},
		tour: {
			type: Schema.Types.ObjectId,
			ref: "Tour",
			// required: [true, "User document cannot cannot be empty"]
		},
		reviewer: {
			type: Schema.Types.ObjectId,
			ref: "User",
			// required: [true, "User document cannot cannot be empty"],
			// unique: true
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

reviewSchema.set("toJSON", {
	versionKey: false,
});

// for nested route^^
reviewSchema.pre(/^find/, function (next) {
	this.populate({ path: "reviewer", select: "-__v -_id" });
	next();
});

//function for aggregating the entire model for calculating ratingCount and ratingAvg
//making static method for this for targetting entire model
reviewSchema.statics.getAvgRatingAndCount = async function (tourId) {
  try {
    const modelAvgStats = await this.aggregate([
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: "$tour",
          totalRatings: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      }
    ]);
	console.log(modelAvgStats)
    if (modelAvgStats.length > 0) {
      const updatedTour = await this.model('Tour').findByIdAndUpdate(
        tourId,
        {
          ratingsAverage: modelAvgStats[0].averageRating,
          ratingsCount: modelAvgStats[0].totalRatings
        },
        {
          new: true
        }
      );
	  return updatedTour
    } else {
      console.log(`No ratings found for tourId ${tourId}`);
    }
	
  } catch (error) {
    console.error('Error updating average rating and count:', error);
    throw error;
  }
};

reviewSchema.post('save', async function () {
  const res = await this.constructor.getAvgRatingAndCount(this.tour);
  console.log(this.constructor)
  console.log(res.ratingsAverage, res.ratingsCount)
});


//for findoneanddelete and findoneandupdate, we wont get to do ggregte properly

reviewSchema.pre(/^findOneAnd/,async function(next){
	console.log('inside findoneand middleware hook')
	//this 'this.resDoc' is just custom prop to pass data to next chained middlware
	this.resDoc = await this.findOne().clone()
	next()
})

reviewSchema.post(/^findOneAnd/, async function() {
	console.log('inside post findone hook!!!!')
	if(this.resDoc){
		const res = await this.resDoc.getAvgRatingAndCount(this.resDoc.tour)
		console.log({res})
	}
	console.log('outside post findone hook!!!!')
});


//creating compound indexes for keeping the review to be unique for each user to review only once
reviewSchema.index({user:1, tour: 1}, {unique: true})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;