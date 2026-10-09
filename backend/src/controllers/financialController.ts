import { Response } from 'express';
import db from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { financialSchemas, FinancialResource } from '../validators/financial.schema';

type Resource = 'accounts' | 'categories' | 'budgets' | 'goals';

const resourceConfig = {
  accounts: {
    table: 'accounts',
    columns: ['name', 'type', 'initial_balance', 'credit_limit', 'closing_day', 'due_day'],
    required: ['name', 'type'],
  },
  categories: {
    table: 'categories',
    columns: ['name', 'type', 'color'],
    required: ['name', 'type'],
  },
  budgets: {
    table: 'budgets',
    columns: ['category', 'month', 'year', 'amount'],
    required: ['category', 'month', 'year', 'amount'],
  },
  goals: {
    table: 'goals',
    columns: ['name', 'target_amount', 'current_amount', 'deadline'],
    required: ['name', 'target_amount'],
  },
} as const;

function getUserId(req: AuthRequest): number | null {
  return req.user?.id ?? null;
}

function parseResourceBody(resource: Resource, body: unknown, partial = false): Record<string, unknown> {
  const schema = financialSchemas[resource as FinancialResource];
  const result = (partial ? schema.partial() : schema).safeParse(body);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

export class FinancialController {
  async list(resource: Resource, req: AuthRequest, res: Response): Promise<Response> {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado.' });
    const { table } = resourceConfig[resource];
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM ${table} WHERE user_id = ? ORDER BY id DESC`,
      [userId],
    );
    return res.status(200).json(rows);
  }

  async create(resource: Resource, req: AuthRequest, res: Response): Promise<Response> {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado.' });
    const config = resourceConfig[resource];
    let body: Record<string, unknown>;
    try {
      body = parseResourceBody(resource, req.body);
    } catch (error) {
      throw error;
    }

    const values = config.columns.map((column) => body[column] ?? null);
    const placeholders = config.columns.map(() => '?').join(', ');
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO ${config.table} (user_id, ${config.columns.join(', ')}) VALUES (?, ${placeholders})`,
      [userId, ...values],
    );
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM ${config.table} WHERE id = ? AND user_id = ?`,
      [result.insertId, userId],
    );
    return res.status(201).json(rows[0]);
  }

  async update(resource: Resource, req: AuthRequest, res: Response): Promise<Response> {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado.' });
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const config = resourceConfig[resource];
    const body = parseResourceBody(resource, req.body, true);
    const assignments = config.columns.filter((column) => body[column] !== undefined);
    if (assignments.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    const values = assignments.map((column) => body[column]);
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE ${config.table} SET ${assignments.map((column) => `${column} = ?`).join(', ')} WHERE id = ? AND user_id = ?`,
      [...values, id, userId],
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado.' });
    return res.status(204).send();
  }

  async remove(resource: Resource, req: AuthRequest, res: Response): Promise<Response> {
    const userId = getUserId(req);
    const id = Number(req.params.id);
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado.' });
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
    const { table } = resourceConfig[resource];
    const [result] = await db.execute<ResultSetHeader>(
      `DELETE FROM ${table} WHERE id = ? AND user_id = ?`,
      [id, userId],
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro não encontrado.' });
    return res.status(204).send();
  }

  async report(req: AuthRequest, res: Response): Promise<Response> {
    const userId = getUserId(req);
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado.' });
    if (!Number.isInteger(year)) {
      return res.status(400).json({ error: 'Informe um ano válido.' });
    }
    if (!req.query.month) {
      const [monthlyRows] = await db.execute<RowDataPacket[]>(
        `SELECT MONTH(date) AS month, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
         FROM transactions WHERE user_id = ? AND YEAR(date) = ?
         GROUP BY MONTH(date) ORDER BY month`,
        [userId, year],
      );
      return res.status(200).json({ monthly: monthlyRows });
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Informe um mês válido.' });
    }
    const [categoryRows] = await db.execute<RowDataPacket[]>(
      `SELECT category, type, SUM(amount) AS total
       FROM transactions
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY category, type ORDER BY total DESC`,
      [userId, month, year],
    );
    const [dailyRows] = await db.execute<RowDataPacket[]>(
      `SELECT DATE(date) AS date, type, SUM(amount) AS total
       FROM transactions
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY DATE(date), type ORDER BY date`,
      [userId, month, year],
    );
    return res.status(200).json({ byCategory: categoryRows, daily: dailyRows });
  }
}
