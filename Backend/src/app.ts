import express, { Router } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';
import authRoutes from './routes/auth.routes';
// import logsRoutes from './routes/logs.routes';
// import userRoutes from './routes/user.routes';
// import adminRoutes from './routes/admin.routes';
// import statRoutes from './routes/stats.routes';

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
// app.use('/api/logs', logsRoutes);
// app.use('/api/stats', statRoutes);
// app.use('/api/user', userRoutes);
// app.use('/api/admin', adminRoutes);
app.use(
  '/',
  Router().get('/', (_req, res) => {
    res.json({ message: 'API Working' });
  })
);

app.use(errorHandler);
app.use(notFoundHandler);

export default app;
