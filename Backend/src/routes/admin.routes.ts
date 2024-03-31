import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
import {
  updateUserById,
  deleteUserById,
} from '../controllers/users.controller';
import { deleteLog, updateLog } from '../controllers/logs.controller';
import {
  createStat,
  updateStatAdmin,
  deleteStat,
} from '../controllers/stats.controller';
import { validateJWT } from '../middlewares/validateJWT';
import { checkPermission } from '../middlewares/checkPermission';
import { IStat } from '../types';
import { calculateXp } from '../middlewares/calculateXp';
import AddOrUpdateStats from '../services/addStats';
import { validateSchema } from '../middlewares/validator.middleware';
import Log from '../models/log.model';
import LogSchemaValidator from '../schemas/log.schema';
import StatSchemaValidator from '../schemas/stat.schema';
import UserSchemaValidator from '../schemas/user.schema';

const router = Router();

//Log routes
router.delete('/logs/:id', validateJWT, checkPermission('admin'), deleteLog); //tested
router.put(
  '/logs/:id',
  validateJWT,
  checkPermission('admin'),
  async (
    req: Request<ParamsDictionary, any, ILog>,
    res: Response,
    next: NextFunction
  ) => {
    const foundLog = await Log.findById(req.params.id);
    if (foundLog) {
      req.body.type = foundLog.type;
      return next();
    }
    return res.status(404).json({ message: 'Log not found' });
  },
  validateSchema(LogSchemaValidator),
  calculateXp,
  updateLog,
  AddOrUpdateStats
); //tested

//User routes
router.put(
  '/users/:id',
  validateJWT,
  checkPermission('admin'),
  validateSchema(UserSchemaValidator),
  updateUserById
); //tested
router.delete(
  '/users/:id',
  validateJWT,
  checkPermission('admin'),
  deleteUserById
); //tested

//Stat routes
router.post<ParamsDictionary, any, IStat>(
  '/stats',
  validateJWT,
  checkPermission('admin'),
  validateSchema(StatSchemaValidator),
  createStat
); //tested
router.put<ParamsDictionary, any, IStat>(
  '/stats/:id',
  validateJWT,
  checkPermission('admin'),
  validateSchema(StatSchemaValidator),
  updateStatAdmin
); //tested
router.delete<ParamsDictionary, any, IStat>(
  '/stats/:id',
  validateJWT,
  checkPermission('admin'),
  deleteStat
); //tested

export default router;
