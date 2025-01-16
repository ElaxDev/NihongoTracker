import { Router } from 'express';
import {
  createAnime,
  createLightNovel,
  createManga,
  getAnimeById,
  updateAnime,
  updateLightNovel,
  updateManga,
  deleteAnime,
  deleteLightNovel,
  deleteManga,
  getMangaById,
  getLightNovelById,
  getVisualNovelById,
  searchAnime,
  getAnimes,
  searchVisualNovel,
} from '../controllers/media.controller';
import { protect } from '../libs/authMiddleware';
import { checkPermission } from '../middlewares/checkPermission';
import { userRoles } from '../types';

const router = Router();

router.post('/anime', protect, checkPermission(userRoles.admin), createAnime);
router.get('/anime', getAnimes);
router.get('/anime/:id', getAnimeById);
router.get('/search-anime', searchAnime);
router.put('/anime', protect, checkPermission(userRoles.admin), updateAnime);
router.delete('/anime', protect, checkPermission(userRoles.admin), deleteAnime);

router.post('/manga', protect, checkPermission(userRoles.admin), createManga);
router.get('/manga', getMangaById);
router.put('/manga', protect, checkPermission(userRoles.admin), updateManga);
router.delete('/manga', protect, checkPermission(userRoles.admin), deleteManga);

router.post(
  '/light-novel',
  protect,
  checkPermission(userRoles.admin),
  createLightNovel
);
router.get('/light-novel', getLightNovelById);
router.put(
  '/light-novel',
  protect,
  checkPermission(userRoles.admin),
  updateLightNovel
);
router.delete(
  '/light-novel',
  protect,
  checkPermission(userRoles.admin),
  deleteLightNovel
);

router.get('/visual-novel/:id', getVisualNovelById);
router.get('/search-vn', searchVisualNovel);

export default router;
