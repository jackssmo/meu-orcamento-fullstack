import { Request, Response, NextFunction } from 'express';
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

  const [, token] = authHeader.split(' ');
  
  if (!token) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  try {
    const secret = process.env.JWT_SECRET || '';
    
    const decoded = jwt.verify(token, secret) as unknown as { id: number };

    req.user = { id: decoded.id };

    return next();

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};