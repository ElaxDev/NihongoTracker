import { Router } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
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
router.delete('/logs/:id', protect, checkPermission('admin'), deleteLog);
router.put<ParamsDictionary, any, ILog>(
  '/logs/:id',
  protect,
  checkPermission('admin'),
  calculateXp,
  updateLog
);

//User routes
router.put('/users/:id', protect, checkPermission('admin'), updateUserById);
router.delete('/users/:id', protect, checkPermission('admin'), deleteUserById);

export default router;
