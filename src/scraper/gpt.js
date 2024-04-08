const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function ChatGpt(text) {
    const messages = [
        { role: "system", content: "system"},
        { role: "user", content: text }
    ];

    try {
        const response = await axios.post("https://deepenglish.com/wp-json/ai-chatbot/v1/chat", {
            messages
        }, {
            headers: {
                Accept: "text/event-stream",
                "Content-Type": "application/json",
            }
        });

        return response.data.answer;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function Gpt2(model, text) {
    const messages = [
        { role: "system", content: model},
        { role: "user", content: text }
    ];

    try {
        const response = await axios.post("https://deepenglish.com/wp-json/ai-chatbot/v1/chat", {
            messages
        }, {
            headers: {
                Accept: "text/event-stream",
                "Content-Type": "application/json",
            }
        });

        return response.data.answer;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function simi(teks) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          "https://api.simsimi.vn/v2/simtalk",
          `text=${encodeURIComponent(teks)}&lc=id`,
        );
        resolve(response.data.message);
      } catch (e) {
        reject("Aku tidak mengerti apa yang kamu katakan.Tolong ajari aku.");
      }
    });
  };

module.exports = {
  ChatGpt, 
  Gpt2,
  simi
};
