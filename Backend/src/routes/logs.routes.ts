import { ParamsDictionary } from 'express-serve-static-core';
import { ICreateAnimeLog } from '../types';
import { Router } from 'express';
import {
  getLog,
  createLog,
  deleteLog,
  updateLog,
  importLogs,
  assignMedia,
} from '../controllers/logs.controller';
import { calculateXp } from '../middlewares/calculateXp';
import { protect } from '../libs/authMiddleware';
// import multer from 'multer';
// import { csvToArray } from '../middlewares/csvToArray';
import getLogsFromAPI from '../middlewares/getLogs';

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

router.get('/importlogs', protect, getLogsFromAPI, calculateXp, importLogs);

router.put('/assign-media', protect, assignMedia);

router.post<ParamsDictionary, any, ICreateAnimeLog>(
  '/',
  protect,
  calculateXp,
  createLog
);

router.get('/:id', getLog);

router.delete('/:id', protect, deleteLog);

router.put('/:id', protect, calculateXp, updateLog);

export default router;
