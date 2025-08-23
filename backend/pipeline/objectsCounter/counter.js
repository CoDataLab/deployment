const fs = require('fs');

function findUniqueAttributes(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const items = JSON.parse(data);

        if (!Array.isArray(items)) {
            throw new Error('The JSON file does not contain an array of objects.');
        }
        const uniqueAttributes = new Set();

        items.forEach(item => {
            Object.keys(item).forEach(key => {
                uniqueAttributes.add(key);
            });
        });

        return Array.from(uniqueAttributes);
    } catch (error) {
        console.error('Error reading or processing the file:', error.message);
        return null;
    }
}

const filePath = '../output/scraped_items.json';

const result = findUniqueAttributes(filePath);
if (result) {
    console.log('Unique attributes found:', result);
}
