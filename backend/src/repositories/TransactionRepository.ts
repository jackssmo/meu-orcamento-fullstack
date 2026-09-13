import db from '../config/db';
import { Transaction } from '../models/Transaction';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class TransactionRepository {
  
  async create(transaction: Transaction): Promise<Transaction> {
    const query = `
      INSERT INTO transactions (user_id, description, amount, type, category, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      transaction.user_id,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.date
    ];

    const [result] = await db.execute<ResultSetHeader>(query, values);

    return {
      id: result.insertId,
      ...transaction
    };
  }

  async findByUserId(userId: number): Promise<Transaction[]> {
    const query = 'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC';
    
    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
    
    return rows as Transaction[];
  }

  async findById(id: number): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE id = ?';
    const [rows] = await db.execute<RowDataPacket[]>(query, [id]);
    
    if (rows.length === 0) return null;
    return rows[0] as Transaction;
  }

  async update(id: number, transaction: Transaction): Promise<void> {
    const query = `
      UPDATE transactions 
      SET description = ?, amount = ?, type = ?, category = ?, date = ?
      WHERE id = ?
    `;
    const values = [
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.date,
      id
    ];

    await db.execute(query, values);
  }

  async delete(id: number): Promise<void> {
    const query = 'DELETE FROM transactions WHERE id = ?';
    await db.execute(query, [id]);
  }

  async getSummary(userId: number): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
      FROM transactions 
      WHERE user_id = ?
    `;

    const [rows] = await db.execute<RowDataPacket[]>(query, [userId]);
    const row = rows[0];

    // Convertemos para Number pois o driver do MySQL pode retornar campos DECIMAL como string
    const totalIncome = Number(row?.totalIncome) || 0;
    const totalExpense = Number(row?.totalExpense) || 0;
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance
    };
  }
}