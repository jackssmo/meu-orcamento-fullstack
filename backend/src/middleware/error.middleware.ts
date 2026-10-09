import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Dados inválidos.',
      details: error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message })),
    });
  }

  const status = typeof error?.statusCode === 'number' ? error.statusCode : 500;
  const message = status >= 500 ? 'Erro interno do servidor.' : error.message;
  if (status >= 500) console.error(error);
  return res.status(status).json({ error: message });
};
