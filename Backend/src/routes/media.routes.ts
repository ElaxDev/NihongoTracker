import { Router } from 'express';
import {
  getMedia,
  searchMedia,
  getAverageColor,
} from '../controllers/media.controller.js';

import { searchYouTubeVideo } from '../services/searchYoutube.js';

const router = Router();

router.get('/utils/avgcolor', getAverageColor);
router.get('/search', searchMedia);
router.get('/youtube/video', searchYouTubeVideo);
router.get('/:mediaType/:contentId', getMedia);

export default router;
