const express = require('express');
const router = express.Router();
const axios = require('axios'); // Needed for the 'check/limit' route

const Comment = require('../models/Comment');
const IPTracker = require('../models/IPTracker');

const { checkCommentLimit } = require('../middleware/checkCommentLimit');

router.get('/article/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Validate articleId parameter
    if (!articleId || articleId.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Article ID is required' 
      });
    }

    console.log(`Fetching comments for article: ${articleId}`);

    // Test basic connection first
    const commentCount = await Comment.countDocuments({ articleId });
    console.log(`Found ${commentCount} comments for article ${articleId}`);

    const comments = await Comment.aggregate([
      {
        $match: { articleId: articleId }
      },
      // Sort by newest first
      {
        $sort: { createdAt: -1 }
      },
      // Join with the 'iptrackers' collection
      {
        $lookup: {
          from: 'iptrackers', // Make sure this collection name is correct
          localField: 'ipAddress',
          foreignField: 'ipAddress',
          as: 'ipInfo'
        }
      },
      // Deconstruct the ipInfo array
      {
        $unwind: {
          path: '$ipInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      // Project the final shape
      {
        $project: {
          _id: 1,
          content: 1,
          author: 1,
          articleId: 1,
          createdAt: 1,
          countryCode: '$ipInfo.countryCode',
          country: '$ipInfo.country'
          // ipAddress is automatically excluded since it's not included
        }
      }
    ]);

    console.log(`Aggregation returned ${comments.length} comments`);

    // Return empty array instead of 404 for no comments
    res.json({ 
      success: true, 
      data: comments,
      count: comments.length 
    });

  } catch (error) {
    console.error("Detailed error fetching comments:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return more specific error information in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching comments',
      ...(isDevelopment && { error: error.message })
    });
  }
});
router.get('/check/limit', async (req, res) => {
  try {
    // This logic is a read-only version of the checkCommentLimit middleware.
    // It's needed to inform the UI of the user's status before they submit a comment.
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const MAX_COMMENTS = 3;

    let ipTracker = await IPTracker.findOne({ ipAddress: clientIP });

    // If this is the first time we see this IP, fetch its geo data and create a record
    if (!ipTracker) {
      try {
        const geoRes = await axios.get(`https://ipapi.co/${clientIP}/json/`);
        const { country_name, country_code } = geoRes.data;

        ipTracker = new IPTracker({
          ipAddress: clientIP,
          country: country_name || "Unknown",
          countryCode: country_code || "",
          commentCount: 0,
          lastReset: new Date()
        });
        await ipTracker.save();
      } catch (geoError) {
        // If the geolocation API fails, we still create a tracker to enforce limits
        console.error("IP Geo Error on check:", geoError.message);
        ipTracker = new IPTracker({ ipAddress: clientIP });
        await ipTracker.save();
      }
    }

    // Check if the 24-hour reset period has passed
    const now = new Date();
    const hoursSinceReset = (now - new Date(ipTracker.lastReset)) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      ipTracker.commentCount = 0;
      ipTracker.lastReset = now;
      await ipTracker.save();
    }
    
    const remainingComments = Math.max(0, MAX_COMMENTS - ipTracker.commentCount);

    res.json({ success: true, remainingComments });

  } catch (error) {
    console.error("Error checking comment limit:", error.message);
    // Even if there's an error, we can default to the max limit to not block the UI
    res.status(500).json({ success: false, remainingComments: 3, message: 'Could not verify comment limit.' });
  }
});

router.post('/add/:articleId', checkCommentLimit, async (req, res) => {
  try {
    const { author, content } = req.body;
    const { articleId } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];

    // Basic validation
    if (!author || !content) {
      return res.status(400).json({ success: false, message: 'Author and content are required' });
    }

    // Create and save the new comment
    const newComment = new Comment({
      content,
      author,
      articleId,
      ipAddress: clientIP // Store the IP with the comment for auditing
    });
    await newComment.save();

    // The middleware attached the ipTracker to the request object.
    // Now we increment its count and save it.
    const ipTracker = req.ipTracker;
    ipTracker.commentCount += 1;
    await ipTracker.save();

    const MAX_COMMENTS = 3;
    const remainingComments = Math.max(0, MAX_COMMENTS - ipTracker.commentCount);

    // Respond with success, the new comment data, and the updated remaining count
    res.status(201).json({
      success: true,
      message: 'Comment posted successfully!',
      data: newComment,
      remainingComments: remainingComments
    });

  } catch (error) {
    console.error("Error posting comment:", error.message);
    res.status(500).json({ success: false, message: 'Server error while posting comment' });
  }
});


module.exports = router;