import { RequestHandler } from 'express';

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
};
