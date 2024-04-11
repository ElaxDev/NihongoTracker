import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
import { Router } from 'express';
import {
  getLog,
  createLog,
  deleteLog,
  updateLog,
} from '../controllers/logs.controller';
import { calculateXp } from '../middlewares/calculateXp';
import { protect } from '../libs/authMiddleware';

const router = Router();

router.get('/:id', getLog);

router.post<ParamsDictionary, any, ILog>('/', protect, calculateXp, createLog);

router.delete('/:id', protect, deleteLog);

router.put('/:id', protect, calculateXp, updateLog);

export default router;
