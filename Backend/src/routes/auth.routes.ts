import { Router } from 'express';
import { logout, auth, refresh } from '../controllers/auth.controller';
import validateGToken from '../middlewares/validateGToken';

const router = Router();

router.post('/google', validateGToken, auth);

router.get('/refresh', refresh);

router.get('/logout', logout);

export default router;
