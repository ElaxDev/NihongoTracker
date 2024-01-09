import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';

export async function calculateXp(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  const { type, episodes, pages, time, chars } = req.body;
  var timeXp = 0;
  var charsXp = 0;
  var pagesXp = 0;
  switch (type) {
    case 'reading':
      timeXp = 0;
      charsXp = 0;
      if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
      if (chars) charsXp = Math.floor((chars / 350) * 5);
      req.body.xp = Math.max(timeXp, charsXp);
      return next();

    case 'anime':
      if (episodes) req.body.xp = Math.floor(((episodes * 45) / 100) * 29);
      return next();

    case 'video':
      if (time) req.body.xp = Math.floor(((time * 45) / 100) * 5);
      return next();

    case 'vn':
      timeXp = 0;
      charsXp = 0;
      if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
      if (chars) charsXp = Math.floor((chars / 350) * 5);
      req.body.xp = Math.max(timeXp, charsXp);
      return next();

    case 'ln':
      timeXp = 0;
      charsXp = 0;
      pagesXp = 0;
      if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
      if (chars) charsXp = Math.floor((chars / 350) * 5);
      if (pages) pagesXp = Math.floor(pages * 5);
      req.body.xp = Math.max(timeXp, charsXp, pagesXp);
      return next();

    case 'manga':
      timeXp = 0;
      charsXp = 0;
      pagesXp = 0;
      if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
      if (chars) charsXp = Math.floor((chars / 350) * 5);
      if (pages) pagesXp = Math.floor(pages * 5);
      req.body.xp = Math.max(timeXp, charsXp, pagesXp);
      return next();

    default:
      return res.status(400).json({ error: 'Invalid log type' });
  }
}
