const Article = require("../models/Article");
const Source = require("../models/Source");
const TopKeywords = require("../models/TopKeywords")
const NodeCache = require("node-cache");
const serverCache = new NodeCache({ stdTTL: 3600 });



async function fetchArticleBiasDistribution(startDate, endDate) {
    try {
        const cacheKey = `biasDistribution-${startDate}-${endDate}`;
        const cachedData = serverCache.get(cacheKey);
        if (cachedData) {
            console.log("Returning cached data");
            return cachedData;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        const articles = await Article.find({
            date: { $gte: start, $lte: end }
        }).lean().sort({date:-1});

        const sourceBiasMap = await Source.find({}, 'source mediaBias').lean();
        const biasCount = {};

        const sourceToBias = {};
        sourceBiasMap.forEach(source => {
            sourceToBias[source.source] = source.mediaBias;
        });

        articles.forEach(article => {
            const bias = sourceToBias[article.source];
            if (bias) {
                biasCount[bias] = (biasCount[bias] || 0) + 1;
            }
        });

        serverCache.set(cacheKey, biasCount);

        return biasCount;
    } catch (error) {
        console.error("Error fetching article bias distribution:", error);
        throw error;
    }
}
async function getLatestHotKeyword(){
    try{
    const topKeyword = await TopKeywords.findOne().sort({createdAt:-1}) ;
    if(!topKeyword) return "No Keyword Found" ;
    let randomIndex = Math.floor(Math.random() * 4); ; 
        return topKeyword.topKeywords[randomIndex].keyword ;
    }catch(err){
        console.log(err) ;
        throw err ;
    }

}
async function getLatestKeywords(){
    try{
    const topKeyword = await TopKeywords.findOne().sort({createdAt:-1}) ;
    if(!topKeyword) return "No Keyword Found" ;
    let randomIndex = Math.floor(Math.random() * 8); ; 
        return topKeyword.topKeywords[randomIndex].keyword ;
    }catch(err){
        console.log(err) ;
        throw err ;
    }

}



module.exports = { fetchArticleBiasDistribution ,getLatestHotKeyword,getLatestKeywords};