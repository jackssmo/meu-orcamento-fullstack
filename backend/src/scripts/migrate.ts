import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { getMysqlOptions } from '../config/mysqlOptions';

dotenv.config();

async function run(): Promise<void> {
  const connection = await mysql.createConnection(getMysqlOptions());

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationsPath = path.resolve(process.cwd(), 'migrations');
    const migrationFiles = (await fs.readdir(migrationsPath))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const migrationName of migrationFiles) {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        'SELECT name FROM schema_migrations WHERE name = ?',
        [migrationName],
      );
      if (rows.length > 0) continue;

      const migration = await fs.readFile(path.join(migrationsPath, migrationName), 'utf8');
      const statements = migration.split(';').map((statement) => statement.trim()).filter(Boolean);
      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (error: unknown) {
          const code = (error as { errno?: number }).errno;
          const isLegacyPasswordRename =
            migrationName === '003_rename_password_column.sql' &&
            statement.startsWith('ALTER TABLE users') &&
            code === 1054;
          if (
            code !== 1050 &&
            code !== 1060 &&
            code !== 1061 &&
            code !== 1826 &&
            !isLegacyPasswordRename
          ) {
            throw error;
          }
        }
      }
      await connection.execute('INSERT INTO schema_migrations (name) VALUES (?)', [migrationName]);
      console.log(`Migration ${migrationName} aplicada com sucesso.`);
    }
  } finally {
    await connection.end();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erro desconhecido';
  console.error(`Falha ao aplicar migrations: ${message}`);
  process.exitCode = 1;
});
