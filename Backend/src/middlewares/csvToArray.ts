import { Request, Response, NextFunction } from 'express';
import { customError } from './errorMiddleware.js';
import csvtojson from 'csvtojson';

export async function csvToArray(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.file) {
      throw new customError('No file uploaded', 400);
    }
    const csvString = req.file.buffer.toString('utf8');
    const results =
      await csvtojson(/*{headers: ["date", "type"]}*/).fromString(csvString);
    req.body = results;

    return next();
  } catch (error) {
    return next(error as customError);
  }
}
