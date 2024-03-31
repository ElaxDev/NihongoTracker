import Router from 'express';
import { getStat } from '../controllers/stats.controller';

const router = Router();

router.get('/:id', getStat);

export default router;
