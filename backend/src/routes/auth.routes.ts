import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Quando vier um POST na rota /register, chame o método register do Controller
router.post('/register', (req, res) => authController.register(req, res));

// Quando vier um POST na rota /login, chame o método login do Controller
router.post('/login', (req, res) => authController.login(req, res));

export default router;