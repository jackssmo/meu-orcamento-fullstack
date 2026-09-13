export interface User {
  id?: number; // Opcional com '?' porque o banco gera automaticamente
  email: string;
  password_hash: string;
  created_at?: Date;
}