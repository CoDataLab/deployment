const axios = require('axios');

// Function to fetch and process data from Feedly API
async function getFeedData(topic) {
  const url = `https://api.feedly.com/v3/recommendations/topics/${topic}?locale=en&ck=1743019960836&ct=feedly.desktop&cv=31.0.2631`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
     
      }
    });

    const feedInfos = response.data.feedInfos.map(feed => {
      return {
        source: feed.title,
        url: feed.id.replace('feed/', ''), 
        logoUrl: feed.iconUrl,
        mediaBias:'center',
        relatedCountry:'Unknown',
        category:"Politics",
        type:"Website"

      };
    });

    return feedInfos;
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}

(async () => {
  const feedData = await getFeedData('politics');
  console.log(JSON.stringify(feedData, null, 2));
})();
