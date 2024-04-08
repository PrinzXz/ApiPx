const axios = require("axios")
const cheerio = require("cheerio")

//YouTube Search
async function youtubeSearch(query) {
  return new Promise(async (resolve, reject) => {
    try {
      let get_data = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(
        query.trim(),
      )}`,
      ).catch(reject);
      let $ = cheerio.load(get_data.data);
      let get_arry = []
      let parse_search;
      for (let i of $('script')) {
        if (i.children && i.children[0] && i.children[0].data.includes('var ytInitialData = ')) {
          parse_search = JSON.parse(
            i.children[0].data.split('var ytInitialData = ')[1].replace(/;/g, ''),);
        }
      }
      if (parse_search) {
        let get_contents =
        parse_search.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;
        let data_search = get_contents.length == 2 ? get_contents[0].itemSectionRenderer.contents: get_contents[1].itemSectionRenderer.contents;

        for (let a of data_search) {
          let i = a.videoRenderer;
          if (i) {
            let prepare_push = {
              videoId: i.videoId,
              url: `https://www.youtube.com${i.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
              title: i.title.runs[0].text,
              description: i.detailedMetadataSnippets?i.detailedMetadataSnippets[0].snippetText.runs[0].text: 'Unknown',
              thumbnail: (i.thumbnail.thumbnails[1] || i.thumbnail.thumbnails[0]).url || 'https://telegra.ph/file/355e8ae7da2299a554eba.jpg',
              duration: i.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer ? i.thumbnailOverlays[0].thumbnailOverlayTimeStatusRenderer.text.simpleText.replace(/\./gi, ':'): 'Unknown',
              uploaded: i.publishedTimeText?i.publishedTimeText.simpleText: 'Unknown',
              views: isNaN(parseInt(i.viewCountText.simpleText && i.viewCountText.simpleText.split(' x ')[0].replace(/\./g, ''))) ? 'Unknown': parseInt(i.viewCountText.simpleText.split(' x ')[0].replace(/\./g, '')),
              isLive: Object.keys(i).includes('badges') && /live/i.test(i.badges[0].metadataBadgeRenderer.label),
              author: {
                name: i.ownerText.runs[0].text,
                url: `https://www.youtube.com${i.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
              },
            };
            if (prepare_push.isLive) {
              delete prepare_push.duration,
              delete prepare_push.uploaded,
              delete prepare_push.views;
            }
            get_arry.push(prepare_push);
          }
        }
        resolve(get_arry);
      }
    } catch (e) {
      return reject(e);
    }
  });
};

async function tiktokSearch(query) {
  try {
    const json = {
      keywords: query,
      count: 15,
      cursor: 0,
      web: 1,
      hd: 1
    }
    
    const { data } = await axios.post("https://tikwm.com/api/feed/search", json, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json, text/javascript, _/_; q=0.01',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
    
    const random = data.data.videos[Math.floor(Math.random() * data.data.videos.length)]

    const result = {
      status: 200,
      creator: "PrinzXz Inc. || Px - Team",
      result: {
        id: random.id,
        title: random.title,
        author: {
          name: random.author.nickname,
          username: random.author.unique_id
        },
        info: {
          play_count: random.play_count,
          like_count: random.digg_count,
          comment_count: random.comment_count,
          share_count: random.share_count
        },
        music_info: random.music_info,
        media: {
          nowm: "https://tikwm.com" + random.play,
          wm: "https://tikwm.com" + random.wmplay,
          music: "https://tikwm.com" + random.music
        }
      }
    }
    
    return result
  } catch (e) {
    return e
  }
}

module.exports = {
  youtubeSearch,
  tiktokSearch
};