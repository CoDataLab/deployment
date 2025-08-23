const natural = require('natural');
const stopwords = require("./stopwords");

const extractTopKeywords = (articles) => {
    const keywordCount = new Map();
    const tokenizer = new natural.WordTokenizer();

    // Step 1: Extract top keywords
    articles.forEach((article) => {
        const keywords = tokenizer
            .tokenize(article.keywords.toLowerCase())
            .filter((keyword) => !stopwords.has(keyword));

        const combinedKeywords = [];
        for (let i = 0; i < keywords.length; i++) {
            let phrase = keywords[i];
            let count = 1;

            while (i + 1 < keywords.length && keywords[i + 1] === keywords[i]) {
                count++;
                i++;
            }

            if (count > 1) {
                phrase = `${phrase} (x${count})`; 
            }
            combinedKeywords.push(phrase);
        }

        combinedKeywords.forEach((keyword) => {
            let matchedKeyword = null;

            for (const existingKeyword of keywordCount.keys()) {
                const similarity = natural.JaroWinklerDistance(keyword, existingKeyword);
                if (similarity > 0.98) {
                    matchedKeyword = existingKeyword;
                    break;
                }
            }

            if (matchedKeyword) {
                keywordCount.set(matchedKeyword, keywordCount.get(matchedKeyword) + 1);
            } else {
                keywordCount.set(keyword, 1);
            }
        });
    });

    // Step 2: Check for combined keywords in headlines
    const combinedKeywordsMap = new Map();

    const topKeywords = Array.from(keywordCount.entries())
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }));

    topKeywords.forEach((keywordObj, index) => {
        const { keyword, count } = keywordObj;
        for (let i = index + 1; i < topKeywords.length; i++) {
            const nextKeywordObj = topKeywords[i];
            const combinedKeyword = `${keyword} ${nextKeywordObj.keyword}`;
            let combinedCount = 0;

            articles.forEach((article) => {
                if (article.headline.toLowerCase().includes(combinedKeyword.toLowerCase())) {
                    combinedCount++;
                }
            });

            if (combinedCount > 1) {
                combinedKeywordsMap.set(combinedKeyword, {
                    keyword: combinedKeyword,
                    count: count + nextKeywordObj.count,
                });
            }
        }
    });

    // Step 3: Merge combined keywords with single keywords
    const finalKeywords = [];

    topKeywords.forEach((keywordObj) => {
        const { keyword, count } = keywordObj;
        let isCombined = false;

        for (const combinedKeyword of combinedKeywordsMap.keys()) {
            if (combinedKeyword.includes(keyword)) {
                isCombined = true;
                break;
            }
        }

        if (!isCombined) {
            finalKeywords.push(keywordObj);
        }
    });

    combinedKeywordsMap.forEach((value) => {
        finalKeywords.push(value);
    });

    // Step 4: Sort final keywords by count
    finalKeywords.sort((a, b) => b.count - a.count);

    return finalKeywords;
};

module.exports = extractTopKeywords;