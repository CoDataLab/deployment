const express = require('express');
const Podcast = require('../models/Podcast');

const router = express.Router();


router.get('/all', async (req, res) => {
  try {
    const podcasts = await Podcast.find().sort({ createdAt: -1 });
    if (!podcasts || podcasts.length === 0) {
      return res.status(404).json({ message: 'No podcasts found' });    
    }
    res.status(200).json(podcasts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { title, author, audioUrl, coverArtUrl, description } = req.body;

    if (!title || !author || !audioUrl || !coverArtUrl) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const newPodcast = new Podcast({
      title,
      author,
      audioUrl,
      coverArtUrl,
      description,

    });

    const savedPodcast = await newPodcast.save();
    res.status(201).json(savedPodcast);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findById(req.params.id);
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    res.status(200).json(podcast);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


router.patch('/update/:id', async (req, res) => {
  try {
    const updatedPodcast = await Podcast.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPodcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    res.status(200).json(updatedPodcast);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const podcast = await Podcast.findByIdAndDelete(req.params.id);
    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }
    res.status(200).json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


module.exports = router;
