const root = process.cwd();

const express = require("express");
const session = require("express-session");
const router = express.Router();

const fs = require("fs");
const { makeUsers, login, syncDb, sleep, loadStats,bcStats } = require(
	`${root}/src/function.js`,
);
const log = require(`${root}/src/lib/logger.js`);
const userStats = loadStats();

const config = require(`${root}/config/config.json`);
const rootPath = { root: __dirname };

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

router.use(
	session({
		secret: "sessionkey",
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 30 * 24 * 60 * 60 * 1000, // atur masa aktif cookies selama 1 bulan
		},
	}),
);

const userDb = `${root}/database/user.json`;

if (!fs.existsSync(userDb)) {
	fs.writeFileSync(userDb, "{}", "utf-8");
}

function isAuth(req, res, next) {
	if (req.session && req.session.user) {
		return next();
	}
	res.redirect("/auth/login");
}

router.get("/login", (req, res) => {
	res.render("login");
});
router.get("/register", (req, res) => {
	res.render("register");
});

router.post("/register", (req, res, next) => {
	if (req) {
		makeUsers(req, res);
		userStats.user.total++;
		bcStats();
		syncDb();
		setTimeout(function () {
			res.redirect("/auth/login");
		}, 2000);
	}
});

router.post("/login", async (req, res, next) => {
	const { phoneNumber } = req.body;
	if (phoneNumber) {
		let Found = await login(req, res);
		if (Found) {
			const userData = JSON.parse(fs.readFileSync(userDb, "utf-8"));
			// Mencari pengguna berdasarkan nomor telepon
			const user = userData[phoneNumber];
			req.session.usrnumber = phoneNumber;
			req.session.user = user;
			userStats.user.online++;
			syncDb();
			bcStats();
			log.succ(`${phoneNumber} Logged in`);
			setTimeout(function () {
				res.redirect("/");
			}, 2000);
		} else {
			res.status(404).json({ msg: false });
			log.err(`Login failed for ${phoneNumber}`);
		}
	}
});

router.get("/logout", (req, res, next) => {
	req.session.destroy;
	setTimeout(function () {
		res.redirect("/auth/login");
	}, 2000);
});

router.post("/register_api", (req, res, next) => {
    if (req) {
        console.log(req.body);
        const { username, number, password } = req.body;
        if (!username || !number || !password) {
            res.json({ msg: "Silakan masukkan data lengkap Anda" });
            return;
        }
        const dataPath = `${root}/database/user.json`;
        const jsonData = fs.readFileSync(dataPath, "utf8");
        const data = JSON.parse(jsonData);
        if (data[number]) {
            res.json({ msg: `User dengan nomor ${number} sudah terdaftar` });
            return;
        }
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
        log.succ(`Register user ${number} berhasil`);
        res.json({ msg: `User dengan nomor ${number} berhasil didaftarkan` });
    }
});


module.exports = router;