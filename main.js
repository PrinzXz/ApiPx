const fs = require("fs");

const { syncDb, resetUserApi, resetStats } = require("./src/function.js");
const { Main, app } = require("./index.js");
const log = require("./src/lib/logger");

const userFilePath = "database/user.json";

const port = 80;

const start = async () => {
	log.warn("prepare server");
	await syncDb();
	await resetStats();
	await resetUserApi();
	await log.warn("database: starting database...");
	log.warn("server: starting webserver...");
	await app.listen(port, async () => {
		log.succ(`server: webserver running in port: ${port}`);
		await Main();
	});
	setInterval(function () {
		syncDb();
	}, 60000);
	setInterval(
		function () {
			resetUserApi();
		},
		60000 * 60 * 24,
	);
};

start();

module.exports = start;
