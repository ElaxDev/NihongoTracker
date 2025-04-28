import express, { Router } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/errorMiddleware.js';
import authRoutes from './routes/auth.routes.js';
import logsRoutes from './routes/logs.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import mediaRoutes from './routes/media.routes.js';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(
  '/api',
  Router().get('/', (_req, res) => {
    res.json({ message: 'API Working' });
  })
);

app.use(notFoundHandler);
app.use(errorHandler);

const globalErrorHandler = function (err: Error): void {
  console.error('Uncaught Exception', err);
};

process.on('unhandledRejection', globalErrorHandler);
process.on('uncaughtException', globalErrorHandler);

export default app;
