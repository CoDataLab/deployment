const axios = require('axios');
const IPTracker = require('../models/IPTracker');

const MAX_COMMENTS = 5;

const checkCommentLimit = async (req, res, next) => {
  try {
    const clientIP = req.ip; 

    let ipTracker = await IPTracker.findOne({ ipAddress: clientIP });

    if (!ipTracker) {
      try {
        const geoRes = await axios.get(`https://ipapi.co/${clientIP}/json/`);
        const { country_name, country_code } = geoRes.data;

        ipTracker = new IPTracker({
          ipAddress: clientIP,
          country: country_name || "Unknown",
          countryCode: country_code || ""
        });
      } catch(geoError) {
        console.error(`IP Geo Error for ${clientIP}:`, geoError.message);
        // If geo API fails, create a record anyway to enforce limits
        ipTracker = new IPTracker({ ipAddress: clientIP });
      }
      await ipTracker.save();
    }

    const now = new Date();
    const hoursSinceReset = (now - new Date(ipTracker.lastReset)) / (1000 * 60 * 60);

    // Reset count if 24 hours have passed
    if (hoursSinceReset >= 24) {
      ipTracker.commentCount = 0;
      ipTracker.lastReset = now;
      await ipTracker.save();
    }

    if (ipTracker.commentCount >= MAX_COMMENTS) {
      return res.status(403).json({
        success: false,
        message: 'Daily comment limit exceeded. You can comment again tomorrow.'
      });
    }

    req.ipTracker = ipTracker; 
    next();
  } catch (error) {
    console.error("Error in checkCommentLimit middleware:", error.message);

    res.status(500).json({ success: false, message: 'Server error verifying comment eligibility.' });
  }
};

module.exports = { checkCommentLimit };