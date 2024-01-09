import { Router } from 'express';
import {
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/users.controller';
import { getUserStats } from '../controllers/stats.controller';
import { validateJWT } from '../middlewares/validateJWT';

const router = Router();

router.get('/:username', getUser);

router.get('/:username/stats', getUserStats);

router.put('/', validateJWT, updateUser);

router.delete('/', validateJWT, deleteUser);

export default router;
