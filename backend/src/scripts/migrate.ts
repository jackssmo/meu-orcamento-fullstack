import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (value === undefined) throw new Error(`${name} não configurado.`);
  return value;
};

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: requiredEnv('DB_HOST'),
    user: requiredEnv('DB_USER'),
    port: Number(process.env.DB_PORT),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
    ssl: {
      rejectUnauthorized: false
    }
  });

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
          if (code !== 1050 && code !== 1060 && code !== 1061 && code !== 1826) throw error;
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
