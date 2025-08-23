const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs').promises;
const {sanitizeText,extractImageURL,normalizeData} = require('./transformer')
const {fetchYoutubeFeed } = require("./fetchYoutubeFeed") ;

const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    explicitRoot: false,
    tagNameProcessors: [
        (name) => {
            const match = name.match(/^.*:(.+)$/);
            return match ? match[1] : name;
        }
    ]
});

function convertToString(value) {
    if (Array.isArray(value)) {
        return value.length > 0 ? String(value[0]) : null; 
    } else if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed && parsed._ ? String(parsed._) : value;
        } catch (e) {
            return value; 
        }
    } else if (value && typeof value === 'object') {
        return value._ ? String(value._) : JSON.stringify(value); 
    }
    return value != null ? String(value) : null; 
}


async function fetchRSSFeed(url, source) {
    try {
        if (url.startsWith("https://www.youtube.com/feeds/videos.xml")) {
            const result = await fetchYoutubeFeed(url);
            if (result.error) {
                throw result.error;
            }
            return result.videos.slice(0, 5); // Limit to 5 items
        }

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const parser = new xml2js.Parser({ 
            explicitArray: false, 
            mergeAttrs: true,
            explicitRoot: false,
            tagNameProcessors: [
                (name) => {
                    const match = name.match(/^.*:(.+)$/);
                    return match ? match[1] : name;
                }
            ]
        });

        const result = await parser.parseStringPromise(response.data);
        const items = result.channel?.item || result.item || [];

        return (Array.isArray(items) ? items : [items]).map((item) => {
            const processedItem = { 
                source: convertToString(typeof item.source === 'object' ? source._ : source)
            };

            for (const [key, value] of Object.entries(item)) {
                if (
                    key !== 'description' && key !== 'content' && key !== 'StoryImage' &&
                    key !== 'fullimage' && key !== 'content:encoded' && key !== 'priority' &&
                    key !== 'commentRss' && key !== 'category' && key !== 'sponsored' &&
                    key !== 'type' && key !== 'comments' && key !== 'thumbnail' &&
                    key !== 'guid' && key !== 'modified' && key !== 'group' &&
                    key !== 'total' && key !== 'enclosure' && key !== 'subject' &&
                    key !== 'post-id' && key !== 'LinkedVideo' && key !== 'updated' &&
                    key !== 'encoded' && key !== 'keywords' && key !== 'id' && key !== 'updatedAt'
                ) {
                    processedItem[key] = value;
                }
            }

            processedItem.title = convertToString(item.title);
            processedItem.creator = convertToString(item.creator);
            processedItem.publisher = convertToString(item.publisher);
            processedItem.author = convertToString(item.author);
          
            processedItem.description = sanitizeText(item.description || '');
            
            // Extract image URL if available
            const imageUrl = extractImageURL(item);
            if (imageUrl) {
                processedItem.imageUrl = imageUrl;
            }

            return processedItem;
        }).slice(0, 5); // Limit to 5 items
    } catch (error) {
        console.error(`Error fetching feed from ${source}:`, error.message);
        return [];
    }
}
async function fetchAllFeeds(feedList) {
    const allItems = [];
    for (const feed of feedList) {
        try {
            console.log(`Fetching feed from: ${feed.source}`);
            const items = await fetchRSSFeed(feed.url, feed.source);
            allItems.push(...items);
            console.log(`Fetched ${items.length} items from ${feed.source}`);
        } catch (error) {
            console.error(`Error fetching feed ${feed.source}: ${error.message}`);
        }
    }
    return allItems;
}
async function scrapePodcastFeed(feedUrl) {
    try {
      const response = await axios.get(feedUrl);
      
      const parser = new xml2js.Parser();
      const feed = await parser.parseStringPromise(response.data);
  
      const podcastItems = feed.rss.channel[0].item || [];
  
      const podcastDetails = podcastItems.map(item => {
        const title = item.title ? item.title[0] : 'No title';
        const pubDate = item.pubDate ? item.pubDate[0] : 'No date';
        const link = item.link ? item.link[0] : 'No link';
        const audioUrl = item.enclosure && item.enclosure.length > 0 && item.enclosure[0].$.url
          ? item.enclosure[0].$.url
          : null;
  
        if (audioUrl) {
          return {
            headline:title,
            date:pubDate,
            articleUrl:link,
            audioUrl:audioUrl,
          };
        }
        return null; 
      }).filter(item => item !== null);
  
      if (podcastDetails.length === 0) {
        throw new Error('No podcast items found with audio URLs.');
      }
  
      return podcastDetails;
  
    } catch (error) {
      console.error('Error fetching or parsing podcast feed:', error.message);
      throw new Error('Failed to scrape podcast feed');
    }
  }
module.exports = { fetchRSSFeed, fetchAllFeeds ,scrapePodcastFeed,convertToString};
