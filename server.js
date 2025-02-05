const dotenv = require("dotenv");
dotenv.config({ path: "./env" });
const mongoose = require("mongoose");
const process = require("process");
const app = require("./app");
const countdown = require("./utils/serverShutdown");


const connectToDatabase = async () => {
	const uri = process.env.DATABASE | process.env.DB_LOCAL;
	try {
		await mongoose.connect(uri);
		console.log("\x1b[36mDB connected successfully!\x1b[0m");

		const server = app.listen(8000, () => {
			console.log("Server is running on port 8000");
		});

		process.on('SIGINT', async () => {
			console.log("Command received, shutting down! " )
			await server.close();
			await mongoose.connection.close(), 

			process.exit(0);
		});
	} catch (error) {
		console.error('\x1b[40mError connecting to database:\x1b[0m', error);
		process.exit(1);
	}
};


connectToDatabase();

process.on('unhandledRejection', (err) => {
	console.log('inside unhandledRejection: ');
	console.error(err.name, err.message);
});

process.on('uncaughtException', (err) => {
	console.error('inside uncaughtException: ', err);
	console.log("shutting down server");
    process.exit(0);
})

