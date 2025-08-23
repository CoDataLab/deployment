const vader = require('vader-sentiment');
const natural = require('natural');
const Sentiment = require('sentiment');
const Article = require('../models/Article');
const sentiment = new Sentiment();
const stopWords = require('./stopwords');   
const nlp = require('compromise');

function analyzeSentiment(text) {
    const vaderResult = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    const vaderScore = vaderResult.compound;

    const tokenizer = new natural.WordTokenizer();
    const tokenizedText = tokenizer.tokenize(text);
    const naturalAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const naturalScore = naturalAnalyzer.getSentiment(tokenizedText);

    const normalizedNaturalScore = naturalScore / 5; 

    const sentimentResult = sentiment.analyze(text);
    const sentimentScore = sentimentResult.comparative; 

    const totalScore = (vaderScore + normalizedNaturalScore + sentimentScore) / 3;

    return totalScore; 
}
function extractKeywords(headline) {
    if (!headline || typeof headline !== 'string') {
        throw new Error('Invalid input. Please provide a valid string.');
    }
    const doc = nlp(headline);
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    let allPotentialKeywords = [...nouns, ...adjectives];
    const cleanedKeywords = allPotentialKeywords
        .map(word => word.trim().toLowerCase().replace(/[^a-z\s]/gi, ''))
        .filter(word => word !== '');

    const filteredKeywords = cleanedKeywords.filter(word => !stopWords.has(word));
    const uniqueKeywords = [...new Set(filteredKeywords)];

    return uniqueKeywords.join(' - ');}

    async function getTotalArticlesCount(days) {
        if (!Number.isInteger(days) || days < 1) {
            throw new Error('Invalid days parameter. Please provide a positive integer.');
        }
    
        const endDate = new Date(); // Current date (now)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days); // Go back 'days' number of days
    
        try {
            // Count the total articles within the time range
            const totalArticles = await Article.countDocuments({
                createdAt: { $gte: startDate, $lt: endDate }
            });
    
            // Count the distinct sources within the same time range
            const distinctSources = await Article.distinct('source', {
                createdAt: { $gte: startDate, $lt: endDate }
            });
    
            // Return both counts
            return {
                totalCount: totalArticles,
                distinctSourceCount: distinctSources.length
            };
        } catch (error) {
            console.error('Error counting articles:', error);
            throw error;
        }
    }
async function getTotalArticlesCountBySource(source) {
    try {
        if (!source || typeof source !== 'string') {
            throw new Error('Invalid source parameter. Please provide a valid string.');
        }

        const regex = new RegExp(source, 'i');

        const endDate = new Date(); // current date/time
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3); // 3 months ago from now

        const totalArticles = await Article.countDocuments({
            source: regex,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        return totalArticles;
    } catch (error) {
        console.error('Error counting articles:', error);
        throw error;
    }
}


module.exports = {
    analyzeSentiment,
    extractKeywords,
    getTotalArticlesCount,
    getTotalArticlesCountBySource
};