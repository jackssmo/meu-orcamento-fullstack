import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/db';
import { User } from '../models/User';
import { IUserRepository } from './IUserRepository';

export class UserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length === 0 ? null : rows[0] as User;
  }

  async save(user: User): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [user.name ?? null, user.email, user.password_hash]
    );
    return { ...user, id: result.insertId };
  }

  async update(id: number, data: { name: string; email: string; password_hash: string }): Promise<void> {
    await pool.query(
      'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
      [data.name, data.email, data.password_hash, id],
    );
  }
}