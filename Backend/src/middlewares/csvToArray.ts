import { Request, Response, NextFunction } from 'express';
import { customError } from './errorMiddleware.js';
import csvtojson from 'csvtojson';
import { csvLogs } from '../types.js';

export async function csvToArray(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      throw new customError('No file uploaded', 400);
    }
    if (req.file.size > 5 * 1024 * 1024) {
      throw new customError('File size exceeds the 5MB limit', 400);
    }
    const csvString = req.file.buffer.toString('utf8');
    const results: csvLogs[] = await csvtojson({
      delimiter: 'auto',
      includeColumns:
        /^(?:type|description|date|time|chars|pages|episodes|mediaId)$/,
    }).fromString(csvString);
    if (results.length === 0) {
      throw new customError('No data found in the CSV file', 400);
    }
    req.body.logs = results.map((log) => {
      const { type, description, date, time, chars, pages, episodes, mediaId } =
        log;
      return {
        type,
        description,
        mediaId,
        date: new Date(date),
        time: Number(time),
        chars: Number(chars),
        pages: Number(pages),
        episodes: Number(episodes),
      };
    });
    return next();
  } catch (error) {
    return next(error as customError);
  }
}
