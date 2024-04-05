import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
import {
  updateUserById,
  deleteUserById,
} from '../controllers/admin.controller';
import { deleteLog, updateLog } from '../controllers/logs.controller';
import {
  createStat,
  updateStatAdmin,
  deleteStat,
} from '../controllers/stats.controller';
import { validateJWT } from '../middlewares/validateJWT';
import { checkPermission } from '../middlewares/checkPermission';
import { IStats } from '../types';
import { calculateXp } from '../middlewares/calculateXp';
// import updateStats from '../services/updateStats';
// import { validateSchema } from '../middlewares/validator.middleware';
import Log from '../models/log.model';

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
  calculateXp,
  updateLog
);

//User routes
router.put('/users/:id', validateJWT, checkPermission('admin'), updateUserById); //tested
router.delete(
  '/users/:id',
  validateJWT,
  checkPermission('admin'),
  deleteUserById
); //tested

//Stat routes
router.post<ParamsDictionary, any, IStats>(
  '/stats',
  validateJWT,
  checkPermission('admin'),
  createStat
);
router.put<ParamsDictionary, any, IStats>(
  '/stats/:id',
  validateJWT,
  checkPermission('admin'),
  updateStatAdmin
);
router.delete<ParamsDictionary, any, IStats>(
  '/stats/:id',
  validateJWT,
  checkPermission('admin'),
  deleteStat
);

export default router;
