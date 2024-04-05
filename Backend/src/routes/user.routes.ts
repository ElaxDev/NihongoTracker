import { Router } from 'express';
import { getUser, updateUser } from '../controllers/users.controller';
import { getUserStats } from '../controllers/stats.controller';
import { getUserLogs } from '../controllers/logs.controller';
import { protect } from '../libs/authMiddleware';
import updateStats from '../services/updateStats';

const router = Router();

router.get('/:username', getUser);

router.get('/:username/stats', getUserStats, updateStats);

router.get('/:username/logs', getUserLogs);

router.put('/', protect, updateUser);

export default router;
