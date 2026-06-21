import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// CORREÇÃO: Interface forte criada
interface JwtPayload {
  userId: string;
  email?: string;
}

// O Request agora sabe que 'user' tem o formato exato do JwtPayload
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Usamos 'as JwtPayload' para afirmar ao TypeScript o formato do dado
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido.' });
  }
};