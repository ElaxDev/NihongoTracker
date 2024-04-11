import { Router } from 'express';
import {
  getRanking,
  getUser,
  updateUser,
} from '../controllers/users.controller';
import { getUserLogs } from '../controllers/logs.controller';
import { protect } from '../libs/authMiddleware';

const router = Router();

router.get('/ranking', getRanking);

router.get('/:username', getUser);

router.get('/:username/logs', getUserLogs);

router.put('/', protect, updateUser);

export default router;
