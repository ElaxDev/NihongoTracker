import { Router } from 'express';
import { login, register, logout } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

export default router;
