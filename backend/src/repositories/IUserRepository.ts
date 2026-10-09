import { User } from '../models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: number, data: { name: string; email: string; password_hash: string }): Promise<void>;
}