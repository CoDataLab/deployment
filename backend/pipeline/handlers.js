const { decode } = require('html-entities');


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

module.exports ={
sanitizeText,
extractImageURL
}