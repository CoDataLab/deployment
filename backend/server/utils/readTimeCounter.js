const axios = require('axios');
const cheerio = require('cheerio');

async function estimateReadTime(url) {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(html);
    
    // Extract text from multiple elements, not just <p> tags
    const textElements = $('p, article, .content, .post-content, .entry-content, main').map((_, el) => $(el).text()).get();
    const fullText = textElements.join(' ');
    
    // Clean and count words
    const cleanText = fullText.replace(/\s+/g, ' ').trim();
    const wordCount = cleanText.split(/\s+/).filter(word => word.length > 0).length;
    
    const wordsPerMinute = 200;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute)); // Minimum 1 minute
    
    return {
      url,
      wordCount,
      readTimeMinutes,
    };
  } catch (error) {
    console.error(`Failed to fetch or parse the article: ${error.message}`);
    return null;
  }
}

module.exports = { estimateReadTime };