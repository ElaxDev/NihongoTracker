import { Router } from 'express';
import {
  getRanking,
  getUser,
  updateUser,
  getUsers,
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

router.put('/', protect, upload.single('avatar'), updateUser);

export default router;
