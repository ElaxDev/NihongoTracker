import { Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog, userRoles } from '../types';
import {
  updateUserById,
  deleteUserById,
} from '../controllers/admin.controller';
import { deleteLog, updateLog } from '../controllers/logs.controller';
import { protect } from '../libs/authMiddleware';
import { checkPermission } from '../middlewares/checkPermission';
import { calculateXp } from '../middlewares/calculateXp';

const router = Router();

//Log routes
router.delete(
  '/logs/:id',
  protect,
  checkPermission(userRoles.admin),
  deleteLog
);
router.put<ParamsDictionary, any, ILog>(
  '/logs/:id',
  protect,
  checkPermission(userRoles.admin),
  calculateXp,
  updateLog
);

//User routes
router.put(
  '/users/:id',
  protect,
  checkPermission(userRoles.admin),
  updateUserById
);
router.delete(
  '/users/:id',
  protect,
  checkPermission(userRoles.admin),
  deleteUserById
);

export default router;
