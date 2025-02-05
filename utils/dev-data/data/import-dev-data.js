const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const process = require("process");

dotenv.config();
const Tour = require("../../models/tourModel");
const Reviews = require("../../models/reviewModel");
//error handling

const connectToDatabase = async () => {
	const uri = process.env.DATABASE;
	await mongoose.connect(uri);
	console.log("DB connected successfully for import-dev-data.js!");

};

connectToDatabase();

//to read json file
const tour = JSON.parse(
	fs.readFileSync("./dev-data/data/tours.json", "utf-8"),
);

const importTour = async () => {
	try {
		await Tour.create(tour);
		console.log("tour parsed and created in db!");
		process.exit()
	} catch (error) {
		console.log(error);
	}
};

const dalitTour = async () => {
	try {
		await Tour.deleteMany();
		console.log("tour deleted!");
		process.exit()
		
	} catch (error) {
		console.log(error);
	}
};

const flushReviews = async () => {
	try {
		await Reviews.deleteMany()
		console.log('flushed reviews completely!')
		process.exit(0)
	} catch (error) {
		console.log("\x1b[41merror nigga!==>\x1b[0m", error);
	}
}

if (process.argv[2] === "--import") {
	importTour();
} else if (process.argv[2] === "--delete-tours") {
	dalitTour();
}else if(process.argv[2] === "--delete-reviews"){
	flushReviews();
}

console.log(process.argv);

