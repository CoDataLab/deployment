# RSS Feed Worker

## Overview
This script is designed to scrape, process, and sanitize RSS feed data. It reads a list of RSS feed URLs from a JSON file, extracts relevant fields, cleans the data, and saves it to a local JSON file. The script supports various RSS feed formats and ensures robust processing.

## Features
- **Fetch RSS Feeds**: Retrieves RSS feed data from multiple sources.
- **Parse XML**: Converts XML data to JavaScript objects using `xml2js`.
- **Sanitize Content**: Cleans HTML content, removes unwanted characters, and decodes HTML entities.
- **Extract Images**: Extracts image URLs from common RSS feed fields.
- **Save Processed Data**: Outputs the processed feed data to `scraped_items.json`.

## Prerequisites
### Node.js
Ensure Node.js is installed. [Download Node.js](https://nodejs.org/)

### Install Dependencies
Run the following command to install required dependencies:
```bash
npm install axios xml2js html-entities
