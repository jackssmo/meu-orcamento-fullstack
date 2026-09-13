import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido. Acesso negado.' });
  }

 const [scheme, token] = authHeader.split(' ');

if (scheme !== 'Bearer' || !token) {
  return res.status(401).json({
    error: 'Token mal formatado. Use Authorization: Bearer <token>.',
  });
}

  try {
    
    const decoded = jwt.verify(token, env.jwtSecret) as { id: number };

    req.user = { id: decoded.id };

    return next();

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};