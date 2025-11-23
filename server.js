const dotenv = require("dotenv");
dotenv.config({"path": ".env"})
const mongoose = require("mongoose");
const process = require("process");
const app = require("./app");
const logger = require("./utils/logger")



const connectToDatabase = async () => {
	const uri = process.env.DB_REMOTE || process.env.DB_LOCAL;
	try {
		await mongoose.connect(uri);
		console.info("DB connected successfully!")

		const port = process.env.PORT;
		const server = app.listen(port, () => {
			console.info(`Server is running on port ${port}`)
			console.info(`URL: \x1b[4mhttp://127.0.0.1:${port}\x1b[0`);
		});

		process.on('SIGINT', async () => {
			console.warn("Command received, shutting down!")
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
	console.error(err.name, err.message);
});

process.on('uncaughtException', (err) => {
	console.log("shutting down server");
    process.exit(0);
})

