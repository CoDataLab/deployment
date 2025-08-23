const { decode } = require('html-entities');
const {extractKeywords,analyzeSentiment} = require('./analyzer') ;
const slugify = require('slugify');



function sanitizeText(text) {
    if (!text) return '';

    try {
        let cleanText = text.replace(/<[^>]*>/g, '');
        
        cleanText = decode(cleanText);
        
        cleanText = cleanText.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        cleanText = cleanText.replace(/\s+/g, ' ').trim();
        cleanText = cleanText.replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F]/g, '');
        cleanText = cleanText.replace(/[^a-zA-Z0-9\s.,!?'-]/g, '');
        
        return cleanText;
    } catch (error) {
        console.error('Error sanitizing text:', error);
        return '';
    }
}

function extractImageURL(item) {
    const imageUrlPatterns = [
      'enclosure.url',
      'thumbnail.url',
      'content.url',
      'content[0].url',
      
      'content[0][url]',
      'content.thumbnail.url',
      'media:content.url',
      'image.url',

      'group.content[0].url',
      'group.content[0][url]',
      'group.content.[0].url',
      'fullimage' 
    ];

    for (const pattern of imageUrlPatterns) {
        try {
            const keys = pattern.split('.');
            let value = item;

            for (const key of keys) {
                const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
                if (arrayMatch) {
                    value = value[arrayMatch[1]][parseInt(arrayMatch[2])];
                } else {
                    value = value[key];
                }
                if (value === undefined) break;
            }
                if (typeof value === 'string' && value.startsWith('http')) {
                return value;
            }
        } catch (error) {
            continue;
        }
    }
    return null;
}
function parseDateToTimestamp(dateString) {
    if (!dateString) return null; // Return null if the date is missing or invalid
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.getTime(); // Return timestamp or null if invalid
}
function normalizeObject(item) {
    const descriptionToAnalyze = item.description && item.description.trim() !== "" 
        ? item.description 
        : item.title;

    const sanitizedDescription = sanitizeText(descriptionToAnalyze).substring(0, 70);
    
    // Extract and analyze sentiment for each keyword independently
    const keywords = extractKeywords(item.title || item.description);
    const keywordList = keywords.split(' - '); // Assuming keywords are joined by ' - '

    let totalSentiment = 0;
    keywordList.forEach(keyword => {
        const sentimentScore = analyzeSentiment(keyword);
        totalSentiment += sentimentScore; // Sum up sentiment scores for each keyword
    });

    const averageSentiment = keywordList.length > 0 ? totalSentiment / keywordList.length : 0; // Calculate the average sentiment

    return {
        headline: item.title || null,
        articleUrl: item.link || null,
        description: item.description || null,
        date: parseDateToTimestamp(item.pubDate || item.date || new Date()),
        imageUrl: item.imageUrl || null,
        source: item.source || null,
        credit: item.credit || null,
        author: item.author || null,
        publisher: item.publisher || null,
        slug:slugify(item.title, { lower: true, strict: true }),
        keywords: extractKeywords(item.title),
        label: averageSentiment || 0,
    };
}

async function normalizeData(data) {
    try {      
        const items = JSON.parse(data);
        if (!Array.isArray(items)) {
            throw new Error('The JSON file does not contain an array of objects.');
        }
        const normalizedItems = items.map(item => normalizeObject(item));
        return normalizedItems; // Return the normalized data
    } catch (error) {
        console.error('Error normalizing data:', error.message);
        throw error; // Rethrow the error for handling by the caller
    }
}


module.exports ={
sanitizeText,
extractImageURL,
normalizeData
}