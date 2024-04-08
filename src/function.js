const root = process.cwd();

const fs = require("fs");
const conn = fs.readFileSync(`${root}/config/config.json`);
const log = require("../src/lib/logger");
const userDb = `${root}/database/user.json`;
const dbPath = [`${root}/database/user.json`, `${root}/database/stats.json`];
const userStats = loadStats()
function readUserData() {
	try {
		return JSON.parse(fs.readFileSync(userDb, "utf8"));
	} catch (error) {
		log.err("Error reading user data:", error.message);
		return null;
	}
}

function writeUserData(userData) {
	try {
		fs.writeFileSync(userDb, JSON.stringify(userData, null, 3), "utf8");
	} catch (error) {
		log.err("Error writing user data:", error.message);
	}
}

function resetUserApi() {
	let time = new Date(Date.now());

	const userData = readUserData();
	log.warn("Mereset api pengguna...");

	if (userData) {
		for (const userId in userData) {
			if (userData.hasOwnProperty(userId)) {
				userData[userId].api.limit = 30;
				userData[userId].api.last_reset = time;
			}
			writeUserData(userData);
		}

		log.succ("Reset api pengguna berhasil dilakukan.");
	}
}

/**
 * getting Data
 * @param {string} req
 * @param {string} res
 * @param {object} data
 * @returns {string}
 */
function getData(req, res, data) {
	let clientIp = req.ip;
	clientIp = clientIp.replace("::ffff:", "");
	log.warn(`new request from: ${clientIp}`);
	return res.status(200).json({
		status: 200,
		response: "OK!",
		message: "Berhasil mengambil data",
		data: JSON.stringify(data, null, 3),
	});
}

function makeKey() {
	let key = "";
	const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const charsLength = chars.length;
	for (let i = 0; i < 10; i++) {
		key += chars.charAt(Math.floor(Math.random() * charsLength));
	}
	key = "Px-" + key;
	return key;
}

/**
 * Create Users
 * @param {string} req
 * @param {string} res
 */
function makeUsers(req, res) {
	const { username, number, password } = req.body;
	if (username && number && password) {
		res.status(200);
		const dataPath = `${root}/database/user.json`;
		const jsonData = fs.readFileSync(dataPath, "utf8");
		const data = JSON.parse(jsonData);
		const newUsers = {
			username: username,
			password: password,
			premium: false,
			isAdmin: false,
			api: {
				key: makeKey(),
				limit: 30,
				usage: 0,
				last_reset: "",
			},
		};
		data[number] = newUsers;
		fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
		log.succ(`register user ${number} berhasil`);
	} else {
		res.json({ msg: "silahkan masukan data anda" });
	}
}

/**
 * Users Login
 * @param {string} req
 * @param {string} res
 * @returns {null}
 */
function login(req, res) {
	const dbUser = JSON.parse(fs.readFileSync(`${root}/database/user.json`));
	const { phoneNumber, password } = req.body;
	for (let userNumber in dbUser) {
		if (dbUser.hasOwnProperty(userNumber)) {
			let user = dbUser[userNumber];
			if (userNumber === phoneNumber && user.password === password) {
				log.succ(phoneNumber + "login");
				return user;
			}
		}
	}
	return null;
}

function syncDb() {
	log.warn("Mensinkronkan Database...");
	dbPath.forEach(path => {
		fs.watchFile(path, (curr, prev) => {});
	});
}

function resetStats() {
	log.warn("Memulai Database...");
	let stats = {
		user: {
			request: 0,
			total: 0,
			online: 0,
		},
	};
	fs.writeFileSync(
		`${root}/database/stats.json`,
		JSON.stringify(stats, null, 3),
	);
}
function loadStats() {
	try {
		const statsData = fs.readFileSync(`${root}/database/stats.json`);
		return JSON.parse(statsData);
	} catch (error) {
		log.err("Error reading user stats:", error);
		return {
			user: {
				request: 0,
				total: 0,
				online: 0,
			},
		};
	}
}

function bcStats() {
	fs.writeFileSync(
		`${root}/database/stats.json`,
		JSON.stringify(userStats, null, 3),
	);
}
/**
 * SleepTime
 * @param {Number} timer
 * @returns {Number}
 */
function sleep(timer) {
	return setTimeout(() => {}, timer);
}

module.exports = {
	getData,
	makeKey,
	makeUsers,
	login,
	syncDb,
	sleep,
	resetUserApi,
	resetStats,
	loadStats,
	bcStats
};