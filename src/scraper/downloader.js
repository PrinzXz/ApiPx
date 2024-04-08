const axios = require("axios")
const cheerio = require("cheerio")
const qs = require("qs")

async function decodeSnap(...args) {
	function _0xe78c(
		d,
		e,
		f
	) {
		var g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('')
		var h = g.slice(0, e)
		var i = g.slice(0, f)
		var j = d.split('').reverse().reduce(function(a, b, c) {
			if (h.indexOf(b) !== -1) return a += h.indexOf(b) * (Math.pow(e, c))
		}, 0)
		var k = ''
		while (j > 0) {
			k = i[j % f] + k
			j = (j - (j % f)) / f
		}
		return k || '0'
	}

	function _0xc60e(
		h,
		u,
		n,
		t,
		e,
		r
	) {
		r = ''
		for (var i = 0, len = h.length; i < len; i++) {
			var s = ''
			while (h[i] !== n[e]) {
				s += h[i]
				i++
			}
			for (var j = 0; j < n.length; j++) {
				s = s.replace(new RegExp(n[j], 'g'), j.toString())
			}
			r += String.fromCharCode((_0xe78c(s, e, 10) - t))
		}
		return decodeURIComponent(encodeURIComponent(r))
	}
	return _0xc60e(...args)
}

async function instagram(url) {
	return new Promise(async (resolve, reject) => {
		try {
			var a = await axios.request("https://snapinsta.app/action2.php?lang=id", {
				method: "POST",
				headers: {
					"user-agent": "Mozilla/5.0 (Linux; Android 11; V2038; Flow) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/359.0.0.288 Mobile Safari/537.36",
					origin: 'https://snapinsta.app',
					referer: 'https://snapinsta.app/',
					Host: "snapinsta.app",
					"content-type": "application/x-www-form-urlencoded",
					accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
				},
				data: new URLSearchParams({
					url: url,
					action: "post"
				})
			})
			var decodeParams = a.data.split('))</script>')[0]
				.split('decodeURIComponent(escape(r))}(')[1]
				?.split(',')?.map(v => v.replace(/^"/, '')
					.replace(/"$/, '').trim())
			if (!Array.isArray(decodeParams) || decodeParams.length !== 6) return reject({
				status: false,
				message: `failed to parse decode params!\n${a.data}`
			})

			var decode = await decodeSnap(...decodeParams)
			var result = decode?.split('("download").innerHTML = "')?.[1].split('; document.getElementById')[0].replaceAll("\\","")
				console.log(result)
			const $ = cheerio.load(result)

			const results = []
			$('.download-content').each(function() {
				let thumbnail = $(this)
					.find('.media-box > img[src]')
					.attr('src')
				if (!/https?:\/\//i.test(thumbnail)) thumbnail = 'https://snapinsta.app' + thumbnail
				let url = $(this).find('.download-bottom > a[href]').attr('href')
				if (!/https?:\/\//i.test(url || '')) {
					url = encodeURI('https://snapinsta.app' + url)
				}
				if (url) results.push({
					thumbnail,
					url
				})
			})
			return resolve({
				status: true,
				data: results
			})
		} catch (e) {
			console.log(e)
			if (e.response) {
				return resolve({
					status: false,
					message: e.response.statusText
				})
			} else {
				return resolve({
					status: false,
					message: e
				})
			}
		}
	})
}

async function twitter(link){
	return new Promise((resolve, reject) => {
		let config = {
			'URL': link
		}
		axios.post('https://twdown.net/download.php',qs.stringify(config),{
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"sec-ch-ua": '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
				"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				"cookie": "_ga=GA1.2.1388798541.1625064838; _gid=GA1.2.1351476739.1625064838; __gads=ID=7a60905ab10b2596-229566750eca0064:T=1625064837:RT=1625064837:S=ALNI_Mbg3GGC2b3oBVCUJt9UImup-j20Iw; _gat=1"
			}
		})
		.then(({ data }) => {
		const $ = cheerio.load(data)
		resolve({
				desc: $('div:nth-child(1) > div:nth-child(2) > p').text().trim(),
				thumb: $('div:nth-child(1) > img').attr('src'),
				video_sd: $('tr:nth-child(2) > td:nth-child(4) > a').attr('href'),
				video_hd: $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href'),
				audio: 'https://twdown.net/' + $('body > div.jumbotron > div > center > div.row > div > div:nth-child(5) > table > tbody > tr:nth-child(3) > td:nth-child(4) > a').attr('href')
			})
		})
	.catch(reject)
	})
}

async function facebook(link){
	return new Promise((resolve,reject) => {
	let config = {
		'url': link
		}
	axios('https://www.getfvid.com/downloader',{
			method: 'POST',
			data: new URLSearchParams(Object.entries(config)),
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				"user-agent":  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
				"cookie": "_ga=GA1.2.1310699039.1624884412; _pbjs_userid_consent_data=3524755945110770; cto_bidid=rQH5Tl9NNm5IWFZsem00SVVuZGpEd21sWnp0WmhUeTZpRXdkWlRUOSUyQkYlMkJQQnJRSHVPZ3Fhb1R2UUFiTWJuVGlhVkN1TGM2anhDT1M1Qk0ydHlBb21LJTJGNkdCOWtZalRtZFlxJTJGa3FVTG1TaHlzdDRvJTNE; cto_bundle=g1Ka319NaThuSmh6UklyWm5vV2pkb3NYaUZMeWlHVUtDbVBmeldhNm5qVGVwWnJzSUElMkJXVDdORmU5VElvV2pXUTJhQ3owVWI5enE1WjJ4ZHR5NDZqd1hCZnVHVGZmOEd0eURzcSUyQkNDcHZsR0xJcTZaRFZEMDkzUk1xSmhYMlY0TTdUY0hpZm9NTk5GYXVxWjBJZTR0dE9rQmZ3JTNEJTNE; _gid=GA1.2.908874955.1625126838; __gads=ID=5be9d413ff899546-22e04a9e18ca0046:T=1625126836:RT=1625126836:S=ALNI_Ma0axY94aSdwMIg95hxZVZ-JGNT2w; cookieconsent_status=dismiss"
			}
		})
	.then(async({ data }) => {
		const $ = cheerio.load(data)	
		resolve({
			video_sd: $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(1) > a').attr('href'),
			video_hd: $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(1) > a').attr('href'),
			audio: $('body > div.page-content > div > div > div.col-lg-10.col-md-10.col-centered > div > div:nth-child(3) > div > div.col-md-4.btns-download > p:nth-child(2) > a').attr('href')
			})
		})
	.catch(reject)
	})
}

async function ytDl(url, type) {
  // https://en.loader.to/4/
  let form = {
    format: type,
    url: url,
  };
  const { data } = await axios.get(
    "https://ab.cococococ.com/ajax/download.php?format=" + type + "&url=" + url,
    form
  );

  let res = await getId(data.id);

  while (
    res.text == null ||
    res.text == "Initialising" ||
    res.text == "Downloading" ||
    res.text == "Converting"
  ) {
    res = await getId(data.id);
    await new Promise((resolve) => setTimeout(resolve, 7000));
    if (res.text == "Finished") {
      res = await getId(data.id);
    }
  }

  async function getId(id) {
    const { data } = await axios.get(
      "https://p.oceansaver.in/ajax/progress.php?id=" + id,
      { id: id }
    );
    return data;
  }
  let result = {
    title: data.info.title,
    thumb: data.info.image,
    link: res.download_url,
  };
  return result;
}

async function tiktokSlide(url) {
    const res = await axios.post("https://tikdownloader.io/api/ajaxSearch", {
        q: url, 
        lang: "en" 
    }, { 
        headers: { 
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", 
            "Accept": "*/*", 
            "X-Requested-With": "XMLHttpRequest"
        }
    })

    const $ = cheerio.load(res.data.data);

    const title = $('h3').text().trim();
    const audio = $('.tik-right .dl-action p a:not(#ConvertToVideo)').attr('href');

    const images = []
    $('ul.download-box li').each((index, element) => {
        const src = $(element).find('.download-items__thumb img').attr('src');
        const dl = $(element).find('.download-items__btn a').attr('href');
        images.push({ thumb: src, url: dl })
    });

    return {
        title,
        images,
        audio
    }
}
const clean = (data) => {
  let regex = /(<([^>]+)>)/gi;
  data = data.replace(/(<br?\s?\/>)/gi, " \n");
  return data.replace(regex, "");
};

async function shortener(url) {
  return url;
}

async function tiktokVideo(URL) {
  return new Promise((resolve, rejecet) => {
    axios
      .get("https://musicaldown.com/id", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
        },
      })
      .then((res) => {
        const $ = cheerio.load(res.data);
        const url_name = $("#link_url").attr("name");
        const token_name = $("#submit-form > div")
          .find("div:nth-child(1) > input[type=hidden]:nth-child(2)")
          .attr("name");
        const token_ = $("#submit-form > div")
          .find("div:nth-child(1) > input[type=hidden]:nth-child(2)")
          .attr("value");
        const verify = $("#submit-form > div")
          .find("div:nth-child(1) > input[type=hidden]:nth-child(3)")
          .attr("value");
        let data = {
          [`${url_name}`]: URL,
          [`${token_name}`]: token_,
          verify: verify,
        };
        axios
          .request({
            url: "https://musicaldown.com/download",
            method: "post",
            data: new URLSearchParams(Object.entries(data)),
            headers: {
              "user-agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
              cookie: res.headers["set-cookie"],
            },
          })
          .then(async (respon) => {
            const ch = cheerio.load(respon.data);
            axios
              .request({
                url: "https://musicaldown.com/id/mp3",
                method: "post",
                headers: {
                  "user-agent":
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
                  cookie: res.headers["set-cookie"],
                },
              })
              .then(async (resaudio) => {
                const hc = cheerio.load(resaudio.data);
                const result = {
                  username:
                    ch(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4.center-align > div > h2:nth-child(2) > b"
                    ).text() || " ",
                  description:
                    ch(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4.center-align > div > h2:nth-child(3)"
                    ).text() || " ",
                  audio_title: (
                    hc(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > h2:nth-child(2)"
                    ).text() || " "
                  ).split(":")[1],
                  audio_original: await shortener(
                    hc(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4 > audio > source"
                    ).attr("src")
                  ),
                  audio: await shortener(
                    hc(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a.btn.waves-effect.waves-light.orange.download"
                    ).attr("href")
                  ),
                  video: await shortener(
                    ch(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(3)"
                    ).attr("href")
                  ),
                  nowatermark: await shortener(
                    ch(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(7)"
                    ).attr("href")
                  ),
                  video_original: await shortener(
                    ch(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l8 > a:nth-child(9)"
                    ).attr("href")
                  ),
                  thumbnail: await shortener(
                    ch(
                      "body > div.welcome.section > div > div:nth-child(3) > div.col.s12.l4.center-align > div > div > img"
                    ).attr("src")
                  ),
                };

                resolve(result);
              });
          });
      });
  });
}

module.exports = {
  instagram,
  twitter,
  facebook,
  ytDl,
  tiktokSlide,
  tiktokVideo
}