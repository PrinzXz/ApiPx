const axios = require("axios");

exports.fetchJson = async (url, options) => {
	try {
		options ? options : {};
		const res = await axios({
			method: "GET",
			url: url,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
			},
			...options,
		});
		return res.data;
	} catch (err) {
		return err;
	}
};

exports.getBuffer = async (url, options) => {
	try {
		options ? options : {};
		const res = await axios({
			method: "get",
			url,
			headers: {
				DNT: 1,
				"Upgrade-Insecure-Request": 1,
			},
			...options,
			responseType: "arraybuffer",
		});
		return res.data;
	} catch (err) {
		return err;
	}
};

exports.randomText = len => {
	const result = [];
	for (let i = 0; i < len; i++)
		result.push(pool[Math.floor(Math.random() * pool.length)]);
	return result.join("");
};

exports.getHashedPassword = password => {
	const sha256 = crypto.createHash("sha256");
	const hash = sha256.update(password).digest("base64");
	return hash;
};

exports.createActivationToken = payload => {
	const activationToken = jwt.sign(payload, ACTIVATION_TOKEN_SECRET, {
		expiresIn: "30m",
	});
	return activationToken;
};

exports.runtime = function (seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor((seconds % (3600 * 24)) / 3600);
	var m = Math.floor((seconds % 3600) / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
};

exports.jsonformat = string => {
	return JSON.stringify(string, null, 2);
};

exports.randomKey = length => {
	let result = "";
	const characters = "abcdefghijklmnopqrstuvwxyz0123456789_";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	result = "Px-" + result
	return result;
};
