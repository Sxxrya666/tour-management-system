const mongoose = require("mongoose");

const { Schema } = mongoose;
const slugify = require("slugify");
const Review = require("../models/reviewModel");

const toursSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "tour name is a required field"],
      unique: true,
      minLength: [4, "tour name must have a minimum of 4 characters"],
      maxLength: [30, "name must have a maximum of 30 characters"],
    },
    urlSlug: String,
    rating: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, "tour price is a required field"],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (valOfDiscountPrice) {
          return valOfDiscountPrice < this.price;
        },
        message: "Discount price {VALUE} must be less than the original price",
      },
    },
    description: {
      type: String,
      required: [true, "tour description is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      trim: true,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "->'{VALUE}'<- must be either easy, medium or difficult",
      },
    },
    summary: {
      type: String,
      required: [true, "tour summary is a required field"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    startDates: {
      type: [Date],
      required: true,
    },
    guides: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    noOfGroups: {
      type: Number,
    },
    
    imageCover: {
      type: String,
      required: [true, "tour must contain cover image"],
    },
    images: [String],
    duration: {
      type: Number,
      required: true,
    },
    ratingsAverage: {
      type: Number,
      required: false,
      default: 4.5,
      min: [1, "rating must be at least 1.0 "],
      max: [10, "rating must be under 10.0 "],
    },
    ratingsCount: {
      type: Number,
      required: false,
    },
    VIPtours: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [{
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }]
  },
  
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

toursSchema.set("toJSON",{
  versionKey: false
})
// Make sure to set this option
toursSchema.set('toJSON', { virtuals: true });
toursSchema.set('toObject', { virtuals: true });

toursSchema.index({price:1, ratingsAverage: -1}, {unique: true})
toursSchema.index({urlSlug:1}, {unique: true})
toursSchema.index({startLocation: '2dsphere'})

toursSchema.virtual("durationInWeeks").get(function () {
  const weeks = this.duration / 7;
  const weekString = weeks === 1 ? "week" : "weeks";
  return `${weeks} ${weekString}`;
});


toursSchema.virtual("reviews", {
  ref: 'Review',
  foreignField: 'tour',
  localField:'_id',
}) 

/////////////////////////////  HOOKS //////////////////////////

toursSchema.pre("save", function () {
  this.urlSlug = slugify(this.name, { replacement: "-", lower: true });
});

//? populating Reviews from 'Review' collection after importing it
//!PAIN IN THE ASS, BUT I LEARNED IT THE HARD WAY to use the select options as "string" and NOT in binary options
toursSchema.pre(/^find/, function(next){
  this.populate({path: "reviews", select: "+reviews -_id"})
  next()
})

toursSchema.pre(/^find/, function (next) {
  //? populating guides from User collection after import
  this.populate({ path: "guides", select: {_id: 0, __v: 0 } }); 
  this.find({ VIPtours: { $ne: true } }); 
  this.start = Date.now();
  next();
});


toursSchema.post(/^find/, function (resp, next) {
  console.log(`The query took ${Date.now() - this.start} millisecs`);
  next();
});

const Tour = mongoose.model("Tour", toursSchema);
module.exports = Tour;