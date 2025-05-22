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
} from '../controllers/logs.controller.js';
import { calculateXp } from '../middlewares/calculateXp.js';
import { protect } from '../libs/authMiddleware.js';
// import multer from 'multer';
// import { csvToArray } from '../middlewares/csvToArray';
import getLogsFromAPI from '../middlewares/getLogs.js';

const router = Router();
// const upload = multer();

//TODO: Add a route to import logs from a CSV file
// router.post<ParamsDictionary, any, ILog[]>(
//   '/importcsv',
//   protect,
//   upload.single('logs'),
//   csvToArray,
//   calculateXp,
//   importLogs
// );

router.post('/importlogs', protect, getLogsFromAPI, calculateXp, importLogs);

router.put('/assign-media', protect, assignMedia);

router.post<ParamsDictionary, any, ICreateLog>(
  '/',
  protect,
  calculateXp,
  createLog
);

router.get('/untrackedlogs', protect, getUntrackedLogs);

router.get('/:id', getLog);

router.delete('/:id', protect, deleteLog);

router.put('/:id', protect, calculateXp, updateLog);

export default router;
