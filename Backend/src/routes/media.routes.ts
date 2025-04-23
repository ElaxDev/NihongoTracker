import { Router } from 'express';
import { getMedia, searchMedia } from '../controllers/media.controller.js';

const router = Router();

router.get('/search', searchMedia);
router.get('/:contentId', getMedia);

export default router;
