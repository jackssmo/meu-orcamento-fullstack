-- Corrige bancos criados com a versão antiga da migration 001.
ALTER TABLE users
  CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL;
