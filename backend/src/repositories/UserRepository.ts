import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../config/db';
import { User } from '../models/User';
import { IUserRepository } from './IUserRepository';

export class UserRepository implements IUserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) return null;
    return rows[0] as User;
  }

  async save(user: User): Promise<User> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [user.email, user.password_hash]
    );
    return { ...user, id: result.insertId };
  }
}