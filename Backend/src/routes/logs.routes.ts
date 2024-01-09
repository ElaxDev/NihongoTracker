import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
import { Router } from 'express';
import { validateJWT } from '../middlewares/validateJWT';
import {
  getLog,
  createLog,
  deleteLog,
  updateLog,
} from '../controllers/logs.controller';
import AddOrUpdateStats from '../services/addStats';
import { validateSchema } from '../middlewares/validator.middleware';
import LogSchemaValidator from '../schemas/log.schema';
import { calculateXp } from '../middlewares/calculateXp';

const router = Router();

router.get('/:id', getLog);
router.post<ParamsDictionary, any, ILog>(
  '/',
  validateJWT,
  validateSchema(LogSchemaValidator),
  calculateXp,
  createLog,
  AddOrUpdateStats
);
router.delete('/:id', validateJWT, deleteLog);
router.put('/:id', validateJWT, calculateXp, updateLog, AddOrUpdateStats);

export default router;
