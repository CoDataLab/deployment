const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pdf = require('html-pdf'); 
const express = require('express');
const router = express.Router();
const Article = require('../server/models/Article');
const { format } = require('date-fns');



const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    const hours = date.getHours();
    let timeOfDay;

    if (hours < 12) {
        timeOfDay = 'Morning';
    } else if (hours < 17) {
        timeOfDay = 'Afternoon';
    } else if (hours < 21) {
        timeOfDay = 'Evening';
    } else {
        timeOfDay = 'Night';
    }

    return `${timeOfDay} of ${formattedDate}`;
};
const currentDate = format(new Date(), 'd MMMM yyyy');


const generatePDFFromArticles = async (articles, topKeywords) => {
    try {
        const fetchImageAsDataURL = async (url) => {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const base64 = Buffer.from(response.data).toString('base64');
            const mimeType = response.headers['content-type'];
            return `data:${mimeType};base64,${base64}`;
        };

        const filePath = path.join(__dirname, 'paper.html');
        let htmlTemplate = fs.readFileSync(filePath, 'utf8');

        const imageDataURL = await fetchImageAsDataURL(articles[0].imageUrl); // Use the first article's image
        const formattedKeywords = topKeywords.topKeywords
            .slice(0, 10)
            .map(keywordObj => keywordObj.keyword)
            .join(' - ');

        const headlines = articles.map(article => article.headline);
        const sources = articles.map(article => article.source);

        htmlTemplate = htmlTemplate
            .replace('{{headline}}', headlines[0])
            .replace('{{topicHeadline1}}', headlines[1] || '')
            .replace('{{topicHeadline2}}', headlines[2] || '')
            .replace('{{topicHeadline3}}', headlines[3] || '')
            .replace('{{topicHeadline4}}', headlines[4] || '')
            .replace('{{source}}', sources[0])
            .replace('{{topicSource1}}', sources[1] || '')
            .replace('{{topicSource2}}', sources[2] || '')
            .replace('{{topicSource3}}', sources[3] || '')
            .replace('{{topicSource4}}', sources[4] || '')
            .replace('{{imageUrl}}', imageDataURL)
            .replace('{{date}}', formatTimestamp(articles[0].date))
            .replace('{{description}}', articles[0].description)
            .replace('{{currentDate}}', currentDate)
            .replace('{{topKeywords}}', formattedKeywords)
            .replace('{{label}}', articles[0].label);

        const pdfOptions = { format: 'A3' };
        const pdfBuffer = await new Promise((resolve, reject) => {
            pdf.create(htmlTemplate, pdfOptions).toBuffer((err, buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });

        return pdfBuffer;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }
};

module.exports = {
    generatePDFFromArticles
};