const dotenv = require("dotenv");
dotenv.config({path: "../../.env"});
const fs = require("fs");
const mongoose = require("mongoose");
const process = require("process");
const {faker}= require('@faker-js/faker')
const Tour = require("../../models/tourModel");
const Reviews = require("../../models/reviewModel");
const Users = require("../../models/userModel");
import chalk from "chalk"
const log = console.log

class DBcli { 
	constructor(){ 
	}

	connectToDatabase = async () => {
		const uri = process.env.DB_LOCAL;
		log(chalk.green({uri}))
		await mongoose.connect(uri);
		log(chalk.blue("DB connected successfully for import-dev-data.js!"));
	};

	importTour = async () => {
		try {
			const tour = await fs.promises.readFile('tours.json', "utf-8" )
			const data = JSON.parse(tour)
			await Tour.create(data.data);
			log(chalk.blue("tour parsed and created in db!")); 
		} catch (error) {
			console.error(chalk.black.red(error));
		}
	};

	dalitTour = async () => {
		try {
			await Tour.deleteMany();
			console.log("tour deleted!");
			
		} catch (error) {
			console.log(error);
		}
	};

	flushReviews = async () => {
		try {
			await Reviews.deleteMany()
			console.log('flushed reviews completely!')
		} catch (error) {
			console.log("\x1b[41merror!==>\x1b[0m", error);
		}
	}

	flushUsers = async () => {
		try {
			await Users.deleteMany()
			console.log('flushed users completely!')
		} catch (error) {
			console.log("\x1b[41merror!==>\x1b[0m", error);
		}
	}

	createMockTourDocs = () => {
		let difficulty = ['easy', 'medium', 'difficult'][Math.floor(Math.random() * 3)]

		let tourSchemaStruc = {
			"name": faker.helpers.arrayElement([
				faker.location.country(), 
				faker.location.county(),
				faker.location.city()
			]),
			"rating": faker.number.float({min: 1, max: 10, fractionDigits: 1}),
			"price": faker.number.float({min: 1, max: 99999999999,  fractionDigits: 4}),
			// "discountPrice": faker.number.float({min: 1, fractionDigits: 4}),
			"description": faker.lorem.paragraph(),
			difficulty, 
			"summary": faker.lorem.lines(2),
			"createdAt": new Date().toISOString(),
			"startDates": new Date().getDate(),
			// "guides": new Array(Math.floor(Math.random() * 9)).fill(faker.person.fullName()),
			"noOfGroups": faker.number.int({min: 1, max: 1000000}),
			"imageCover": faker.image.url(),
			"images": Array(Math.floor(Math.random() * 9)).fill(faker.image.url()) ,
			"duration": faker.number.int({min: 1, max: 3000}),
			"ratingsAverage": faker.number.float({min: 1, max: 10, fractionDigits: 1}),
			"ratingsCount": faker.number.int(),
			"VIPtours": [true, false][Math.floor(Math.random() * 2)],
			"startLocation": [faker.location.longitude(), faker.location.latitude()],
			"locations": Array(6).fill(
					[faker.location.longitude(), faker.location.latitude()]
				)
		}
		return tourSchemaStruc
	}

	insertFakeTours = (userCount) => {
		const finalMock = {
			data: []
		}; 
		log(`Creating ${userCount} number of tour documents!`)
		for (let i = 0; i < userCount; i++){
			const getFakeData = createFakeTour(); 
			finalMock.data.push(getFakeData); 
		}
		const json = JSON.stringify(finalMock); 
		
		// convert them and dump it to a json file
		fs.writeFile('tours.json', json , 'utf-8', (err)=>{
			if (err) throw new Error("Error reading the jsonfile!")
			log('Dumped new data successfully!')
		})
		log('after res Dumped new data successfully!')
	}

}

async function main () { 
	try { 
		const db = new DBcli(); 
		console.info("connecting to db...")
		await db.connectToDatabase();
		console.info("Connected db successfully!")
	
		if (process.argv[2] === "--import-tour") {
			await db.importTour();
		} else if (process.argv[2] === "--delete-tours") {
			await db.dalitTour();
		} else if(process.argv[2] === "--delete-reviews"){
			await db.flushReviews();
		} else if(process.argv[2] === "--create-tours"){
			const userCount = process.argv[3] * 1; 
			await db.insertFakeTours(userCount)
		} else if(process.argv[2] === "--flush-users"){
			await db.flushUsers();
		} else { 
			log(chalk.red(`The flag appended '${process.argv[2]}' is not found!`))
		}
	} catch (e){ 
		log(chalk.black.bgRedBright("error from Class: ",  e ))
		process.exit(1)
	} finally { 
		console.info(chalk.black.yellow("Exiting cli app..."))
		process.exit(0)
	}
}

main()