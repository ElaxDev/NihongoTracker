import { Router } from 'express';
import {
  getRanking,
  getUser,
  updateUser,
  getUsers,
  clearUserData,
} from '../controllers/users.controller';
import { getUserLogs } from '../controllers/logs.controller';
import { protect } from '../libs/authMiddleware';
import multer from 'multer';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

router.get('/', getUsers);

router.get('/ranking', getRanking);

router.get('/:username', getUser);

router.get('/:username/logs', getUserLogs);

router.put(
  '/',
  protect,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  updateUser
);

router.post('/cleardata', protect, clearUserData);

export default router;
