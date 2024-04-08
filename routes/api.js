const root = process.cwd();
/* Untuk module ada di bawah ini */
const express = require("express");
const fs = require("fs/promises");
/* import module dari src/ */
const { getData, loadStats, syncDb, bcStats } = require(`${root}/src/function.js`);
const { instagram, twitter, facebook, ytDl, tiktokSlide, tiktokVideo } = require(`${root}/src/scraper/downloader.js`);
const { ChatGpt, Gpt2, simi } = require(`${root}/src/scraper/gpt.js`);
const { youtubeSearch, tiktokSearch } = require(`${root}/src/scraper/search.js`);
const config = require(`${root}/config/config.json`);
const router = express.Router();
const msg = config.msg;

const userStats = loadStats();
const checkKey = async (req, res, next) => {
	const apiKey = req.query.apikey;

	try {
		const data = await fs.readFile(`${root}/database/user.json`);
		const users = JSON.parse(data);
		const user = Object.values(users).find(u => u.api.key === apiKey);
		console.log(user);
		if (!user) {
			return res.status(401).json({ error: "Invalid API key" });
		}
		// Mengecek batas penggunaan
		if (user.api.limit <= 0) {
			return res.status(429).json({ error: "API key usage limit exceeded" });
		}
		// Mengurangi batas penggunaan
		user.api.limit--;
		user.api.usage++;
		userStats.user.request++;
		// Menyimpan perubahan ke dalam file
		await fs.writeFile(
			`${root}/database/user.json`,
			JSON.stringify(users, null, 4),
		);
		await fs.writeFile(
			`${root}/database/stats.json`,
			JSON.stringify(userStats, null, 4),
		);
		bcStats();
		syncDb();
		// API key valid, lanjutkan ke endpoint berikutnya
		next();
	} catch (error) {
		res.status(500).json({ status: 500, msg: error });
	}
};

/*router*/
// Ai
router.get("/ai/chatgpt", checkKey, async (req, res, next) => {
	let q = req.query.q;
	if (q) {
		try {
			let result = await ChatGpt(q);
			getData(req, res, result);
		} catch (e) {
			res.json(msg.srvErr);
		}
	} else {
		res.status(404).json(msg.needQuery);
	}
});

//Downloader
router.get("/downloader/instagram", checkKey, async (req, res, next) => {
	let url = req.query.url;
	if (url) {
		try {
			let result = await instagram(url);
			getData(req, res, result);
		} catch (e) {
			res.json(msg.srvErr);
		}
	} else {
		res.status(404).json(msg.needUrl);
	}
});

router.get("/downloader/tiktokVideo", checkKey, async (req, res, next) => {
	let url = req.query.url;
	if (url) {
		try {
			let result = await tiktokVideo(url);
			getData(req, res, result);
		} catch (e) {
			res.json(msg.srvErr);
		}
	} else {
		res.status(404).json(msg.needUrl);
	}
});

router.get("/downloader/youtubeMp3", checkKey, async (req, res, next) => {
	let url = req.query.url;
	if (url) {
		try {
			let result = await ytDl(url, "mp3");
			getData(req, res, result);
		} catch (e) {
			res.json(msg.srvErr);
		}
	} else {
		res.status(404).json(msg.needUrl);
	}
});

router.get("/downloader/youtubeMp3", checkKey, async (req, res, next) => {
	let url = req.query.url;
	if (url) {
		try {
			let result = await ytDl(url, "mp4");
			getData(req, res, result);
		} catch (e) {
			res.json(msg.srvErr);
		}
	} else {
		res.status(404).json(msg.needUrl);
	}
});

//Searching
router.get("/search/youtubeSearch", checkKey, async (req, res, next) => {
	let query = req.query.q;
	if (query) {
		try {
			let result = await youtubeSearch(query);
			getData(req, res, result);
		} catch (e) {
			res.json(msg.srvErr);
		}
	} else {
		res.status(404).json(msg.needQuery);
	}
});

router.get("/search/tiktokSearch", checkKey, async (req, res, next) => {
	let query = req.query.q;
	if (query) {
		try {
			let result = await tiktokSearch(query);
			getData(req, res, result);
		} catch (e) {
			res.json(msg.srvErr);
		}
	} else {
		res.status(404).json(msg.needQuery);
	}
});

module.exports = router;
