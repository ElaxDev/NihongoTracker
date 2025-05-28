import { ParamsDictionary } from 'express-serve-static-core';
import { ICreateLog } from '../types.js';
import { Router } from 'express';
import {
  getLog,
  createLog,
  deleteLog,
  updateLog,
  importLogs,
  assignMedia,
  getUntrackedLogs,
  recalculateXp,
} from '../controllers/logs.controller.js';
import { calculateXp } from '../middlewares/calculateXp.js';
import { protect } from '../libs/authMiddleware.js';
import { csvToArray } from '../middlewares/csvToArray.js';
import multer from 'multer';
import { getLogsFromAPI, getLogsFromCSV } from '../middlewares/getLogs.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post('/import', protect, getLogsFromAPI, calculateXp, importLogs);

router.post(
  '/importfromcsv',
  protect,
  upload.single('csv'),
  csvToArray,
  getLogsFromCSV,
  calculateXp,
  importLogs
);

router.put('/assign-media', protect, assignMedia);

router.post<ParamsDictionary, any, ICreateLog>(
  '/',
  protect,
  calculateXp,
  createLog
);

router.get('/untrackedlogs', protect, getUntrackedLogs);

router.get('/recalculateStats', protect, recalculateXp);

router.get('/:id', getLog);

router.delete('/:id', protect, deleteLog);

router.put('/:id', protect, calculateXp, updateLog);

export default router;
