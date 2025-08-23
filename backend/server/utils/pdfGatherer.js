const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const RateLimit = require('axios-rate-limit');

const baseUrl = 'https://scholar.google.com/scholar';

const http = RateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000 });

const scrapePage = async (query, start) => {
  const url = `${baseUrl}?start=${start}&q=${query}&hl=en&as_sdt=0,5`;

  try {
    const response = await http.get(url, { timeout: 10000 }); // Timeout after 10 seconds
    const html = response.data;
    const $ = cheerio.load(html);
    const results = [];

    $('.gs_r.gs_or.gs_scl').each((index, element) => {
      const titleElement = $(element).find('.gs_rt a');
      const pdfElement = $(element).find('.gs_ggs .gs_or_ggsm a');
      const descriptionElement = $(element).find('.gs_rs');

      const title = descriptionElement.text().trim();
      const link = titleElement.attr('href');
      const pdfLink = pdfElement.attr('href');

      // Ignore results with pdf_url from https://www.academia.edu
      if (title && link && pdfLink && pdfLink.endsWith('.pdf') && !pdfLink.includes('https://www.academia.edu')
        && !pdfLink.includes('https://www.researchgate')) {
        results.push({
          title: title,
        
          pdf_url: pdfLink
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error fetching the page:', error);
    return [];
  }
};

const gatherPdfs = async (query, maxResults = 8) => {
  let allResults = [];
  let start = 0;

  while (allResults.length < maxResults) {
    const pageResults = await scrapePage(query, start);
    if (pageResults.length === 0) break; // No more results
    allResults.push(...pageResults);
    start += 10;
  }

return allResults ;
};

module.exports = { gatherPdfs };
