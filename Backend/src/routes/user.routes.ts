import { Router } from 'express';
import { getUser, updateUser } from '../controllers/users.controller';
import { getUserStats } from '../controllers/stats.controller';
import { protect } from '../libs/authMiddleware';

const router = Router();

router.get('/:username', getUser);

router.get('/:username/stats', getUserStats);

router.put('/', protect, updateUser);

export default router;
