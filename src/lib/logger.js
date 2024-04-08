const fs = require("fs");

const chalk = require("chalk");
const moment = require("moment-timezone");

moment.tz.setDefault("Asia/Makassar");

const log = {
	warn: function (message) {
		const now = moment();
		const date = chalk.yellow.bold(now.format("DD-MM-YYYY"));
		const hour = chalk.yellow.bold(now.format("HH"));
		const minute = chalk.yellow.bold(now.format("mm"));
		message = chalk.yellow(message);

		console.log(`[${date}-${hour}:${minute}] => ${message}`);
	},
	succ: function (message) {
		const now = moment();
		const date = chalk.yellow.bold(now.format("DD-MM-YYYY"));
		const hour = chalk.yellow.bold(now.format("HH"));
		const minute = chalk.yellow.bold(now.format("mm"));
		message = chalk.green(message);

		console.log(`[${date}-${hour}:${minute}] => ${message}`);
	},
	err: function (message) {
		const now = moment();
		const date = chalk.yellow.bold(now.format("DD-MM-YYYY"));
		const hour = chalk.yellow.bold(now.format("HH"));
		const minute = chalk.yellow.bold(now.format("mm"));
		message = chalk.redBright(message);

		console.log(`[${date}-${hour}:${minute}] => ${message}`);
	},
};

module.exports = log;
