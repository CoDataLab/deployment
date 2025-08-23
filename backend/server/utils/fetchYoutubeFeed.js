const axios = require('axios');
const xml2js = require('xml2js');

async function fetchYoutubeFeed(feedUrl) {
  try {
    const response = await axios.get(feedUrl);
    const xmlData = response.data;

    const parser = new xml2js.Parser();
    const jsonData = await parser.parseStringPromise(xmlData);

    if (!jsonData.feed || !jsonData.feed.entry) {
      throw new Error('Invalid feed structure');
    }

    const source = jsonData.feed.author?.[0]?.name?.[0] || 'Unknown Source';
    const videos = jsonData.feed.entry.map(entry => {
      const description = entry['media:group']?.[0]?.['media:description']?.[0]
        .replace(/(\r\n|\n|\r)/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || 'No description available';

      const publishedStr = entry.published?.[0];
      const publishedDate = publishedStr ? new Date(publishedStr) : new Date();
      const now = new Date();
      const finalDate = (publishedDate > now) ? now : publishedDate;

      // Extract videoId
      const videoId = entry['yt:videoId']?.[0] || 'No video ID';

      return {
        title: entry.title?.[0] || 'No title',
        description,
        imageUrl: entry['media:group']?.[0]?.['media:thumbnail']?.[0]?.$.url || 'No image URL',
        link : `https://www.youtube.com/embed/${videoId}`,
        date: finalDate,
        source,
    
      };
    });

    return { videos };
  } catch (error) {
    return { error };
  }
}

module.exports = { fetchYoutubeFeed };
