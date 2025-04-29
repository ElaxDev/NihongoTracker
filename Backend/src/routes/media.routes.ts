import { Router } from 'express';
import {
  getMedia,
  searchMedia,
  getAverageColor,
} from '../controllers/media.controller.js';

const router = Router();

router.get('/utils/avgcolor', getAverageColor);
router.get('/search', searchMedia);
router.get('/:contentId', getMedia);

export default router;
