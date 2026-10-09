ALTER TABLE users ADD COLUMN name VARCHAR(120) NULL AFTER id;

ALTER TABLE transactions ADD COLUMN is_fixed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN installments INT NOT NULL DEFAULT 1;
ALTER TABLE transactions ADD COLUMN installment_number INT NOT NULL DEFAULT 1;
ALTER TABLE transactions ADD COLUMN recurrence_end_date DATE NULL;
ALTER TABLE transactions ADD COLUMN account_id INT NULL;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(80) NOT NULL,
  type ENUM('income', 'expense', 'both') NOT NULL DEFAULT 'both',
  color VARCHAR(7) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_user_name (user_id, name),
  CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(80) NOT NULL,
  type ENUM('checking', 'cash', 'savings', 'credit_card') NOT NULL,
  initial_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  credit_limit DECIMAL(12,2) NULL,
  closing_day TINYINT NULL,
  due_day TINYINT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE transactions
  ADD CONSTRAINT fk_transactions_account
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(80) NOT NULL,
  month TINYINT NOT NULL,
  year SMALLINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  UNIQUE KEY uq_budgets_period (user_id, category, month, year),
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  deadline DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
