const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
	{
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 10,
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
		},
		reviewer: {
			type: Schema.Types.ObjectId,
			ref: "User",
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

reviewSchema.pre(/^findOneAnd/,async function(next){
	this.resDoc = await this.findOne().clone()
	next()
})

reviewSchema.post(/^findOneAnd/, async function() {
	if(this.resDoc){
		const res = await this.resDoc.getAvgRatingAndCount(this.resDoc.tour)
	}
});

reviewSchema.index({user:1, tour: 1}, {unique: true})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;