const axios = require('axios');
const cheerio = require('cheerio');
const { analyzeSentiment } = require('./analyzer'); // Assuming you have a sentiment analysis function
const URL = 'https://citizenfreepress.com/';

async function gatherTweets() {
  try {
    const { data: html } = await axios.get(URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/',
        'DNT': '1',
        'Connection': 'keep-alive'
      }
    });

    const $ = cheerio.load(html);
    const tweets = [];

    const tweetPromises = $('ul.wpd-top-links li a').map(async (i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();

      if (href && href.startsWith('https://x.com/')) {
        const match = href.match(/^https:\/\/x\.com\/([^/]+)/);
        const account = match ? match[1] : null;

        const sentimentLabel = await analyzeSentiment(text); // Use 'text' instead of 'tweet'
        
        tweets.push({
          tweet: text,
          tweetUrl: href,
          account,
          label: sentimentLabel
        });
      }
    }).get();

    await Promise.all(tweetPromises);

    return tweets;
  } catch (error) {
    console.error('Error during scraping:', error.message);
    return [];
  }
}

module.exports = { gatherTweets };
