const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");

const ipfilter = require("express-ipfilter").IpFilter;
const log = require("./src/lib/logger.js");
const app = express();

/* Server */
const { syncDb, loadStats } = require("./src/function.js");

const conn = require("./config/config.json");
const api = require("./routes/api.js");
const auth = require("./routes/auth.js");
const userstat = loadStats();
// config
const port = conn.srv.port;
const rootPath = { root: __dirname };

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const day = String(currentDate.getDate()).padStart(2, "0");

const tanggal = `${year}-${month}-${day}`;

async function Main() {
	log.succ("server running");
	app.use(express.static("public"));
	app.set("view engine", "ejs");
	app.set("views", "public");

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	// Middleware CORS
	app.use(cors());

	app.use(
		session({
			secret: "loged",
			resave: false,
			saveUninitialized: false,
			cookie: {
				maxAge: 30 * 24 * 60 * 60 * 1000, // atur masa aktif cookies selama 1 bulan
			},
		}),
	);

	function isAuth(req, res, next) {
		if (req.session && req.session.user) {
			return next();
		}
		res.redirect("/auth/login");
	}

	// anti ddos

	const blockedIPs = [];
	const requestTracker = {};

	const DDoS_THRESHOLD = conn.srv.req_limit;
	const DETECTION_WINDOW = conn.srv.detect_window;

	// Middleware untuk melacak dan memblokir IP
	const ipFilter = ipfilter({
		detectIp: req => req.ip,
		forbiddenResponse: "IP Anda diblokir karena aktivitas yang mencurigakan.",
		log: true,
	});

	app.use(ipFilter);

	app.use((req, res, next) => {
		const clientIP = req.ip;
		requestTracker[clientIP] = (requestTracker[clientIP] || 0) + 1;
		setTimeout(() => {
			requestTracker[clientIP] = 0;
		}, DETECTION_WINDOW);
		if (
			requestTracker[clientIP] > DDoS_THRESHOLD &&
			!blockedIPs.includes(clientIP)
		) {
			log(`Deteksi DDoS dari IP: ${clientIP}, blokir IP.`);
			blockedIPs.push(clientIP);
		}
		next();
	});

	app.get("/", isAuth, (req, res) => {
		let ip = req.ip;

		const data = {
			user: req.session.user,
			ip: ip,
			stats: userstat,
			date: tanggal,
		};
		console.log(data);
		res.render("dash", data);
	});

	//other route
	app.use("/auth", auth);
	app.use("/api", api);

	/*Pengalihan jika route url tidak ada, tidak boleh di pindah ke atas*/
	app.use("/", (req, res) => {
		res.status(404);
		res.sendFile("./public/404.html", rootPath);
	});
}

module.exports = { app, Main };
