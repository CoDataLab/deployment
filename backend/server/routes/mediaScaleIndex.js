const express = require('express');
const router = express.Router();
const MediaScaleService = require('../services/MediaScaleService');

const mediaScaleService = new MediaScaleService();

router.post('/calculate/:category', mediaScaleService.calculateScoresByCategory.bind(mediaScaleService));

router.get('/category/:category', mediaScaleService.getByCategory.bind(mediaScaleService));

router.get('/latest', mediaScaleService.getLatest.bind(mediaScaleService));
router.delete('/delete/:id', mediaScaleService.deleteById.bind(mediaScaleService));
router.get('/ranking/:category/:sourceId', mediaScaleService.getSourceRanking.bind(mediaScaleService));


module.exports = router;
