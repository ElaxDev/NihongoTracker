import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
import { Router } from 'express';
// import { validateJWT } from '../middlewares/validateJWT';
import {
  getLog,
  createLog,
  deleteLog,
  updateLog,
} from '../controllers/logs.controller';
// import AddOrUpdateStats from '../services/addStats';
// import { validateSchema } from '../middlewares/validator.middleware';
// import LogSchemaValidator from '../schemas/log.schema';
import { calculateXp } from '../middlewares/calculateXp';
import { protect } from '../libs/authMiddleware';

const router = Router();

router.get('/:id', getLog);
router.post<ParamsDictionary, any, ILog>('/', protect, calculateXp, createLog);
router.delete('/:id', protect, deleteLog);
router.put('/:id', protect, calculateXp, updateLog);

export default router;
