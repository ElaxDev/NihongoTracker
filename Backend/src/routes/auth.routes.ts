import { Router } from 'express';
import { logout, auth, refresh } from '../controllers/auth.controller';
import validateGToken from '../middlewares/validateGToken';
import { validateJWT } from '../middlewares/validateJWT';

const router = Router();

router.post('/google', validateGToken, auth);

router.post('/refresh', validateJWT, refresh);

router.post('/logout', logout);

export default router;
