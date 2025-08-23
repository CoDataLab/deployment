const express = require('express');
const router = express.Router();
const User = require("../models/User") ;
const {authorizeRole} = require('../middleware/authMiddleware');


router.get('/all', authorizeRole("owner"),async (req, res) => {
    try {
        const users = await User.find() ;
        if(!users) return res.status(404).json({message:'No User found'});
        res.status(200).json({users}) ;
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

module.exports = router;