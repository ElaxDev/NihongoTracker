import { Router } from 'express';
import { logout, auth, refresh } from '../controllers/auth.controller';
import validateGToken from '../middlewares/validateGToken';

const router = Router();

router.post('/google', validateGToken, auth);

router.get('/refresh', refresh);

router.post('/logout', logout);

export default router;
