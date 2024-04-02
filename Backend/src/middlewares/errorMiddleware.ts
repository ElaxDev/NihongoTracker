import { Request, Response, NextFunction } from 'express';

export class customError extends Error {
  statusCode?: number;
  kind?: string;

  constructor(message: string, statusCode?: number, kind?: string) {
    super(message);
    this.statusCode = statusCode;
    this.kind = kind;
  }
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const error: customError = new customError(
    `Not Found - ${req.originalUrl.toString()}`
  );
  res.status(404);
  return next(error);
}

export function errorHandler(
  err: customError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message ? err.message : 'Internal Server Error';

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  return res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}
