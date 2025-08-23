const fs = require('fs').promises;

// Function to convert a date string to a timestamp
function parseDateToTimestamp(dateString) {
    if (!dateString) return null; // Return null if the date is missing or invalid
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.getTime(); // Return timestamp or null if invalid
}

// Function to normalize an object based on defined mapping
function normalizeObject(item) {
    return {
        headline: item.title || null,
        articleUrl: item.link || null,
        description: item.description || null,
        date: parseDateToTimestamp(item.pubDate || item.date),
        imageUrl: item.imageUrl || null,
        source: item.source || null,
        credit: item.credit || null,
        author: item.author || null,
        publisher: item.publisher || null
    };
}

// Function to normalize all objects in a JSON file
async function normalizeData(filePath, outputFilePath) {
    try {
        // Read the JSON file
        const data = await fs.readFile(filePath, 'utf8');
        const items = JSON.parse(data);

        if (!Array.isArray(items)) {
            throw new Error('The JSON file does not contain an array of objects.');
        }

        // Normalize each object in the array
        const normalizedItems = items.map(item => normalizeObject(item));

        // Save the normalized data to a new file
        await fs.writeFile(outputFilePath, JSON.stringify(normalizedItems, null, 2));
        console.log(`Normalized data saved to ${outputFilePath}`);
    } catch (error) {
        console.error('Error normalizing data:', error.message);
    }
}

// Example usage
const inputFilePath = '../output/scraped_items.json'; // Path to your input JSON file
const outputFilePath = './normalized_items.json'; // Path to save normalized JSON file

normalizeData(inputFilePath, outputFilePath);
