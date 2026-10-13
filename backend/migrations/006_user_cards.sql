CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cards_user_name (user_id, name),
  CONSTRAINT fk_cards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE transactions
  MODIFY COLUMN card VARCHAR(120) NULL;

INSERT IGNORE INTO cards (user_id, name)
SELECT id, 'Nubank' FROM users;

INSERT IGNORE INTO cards (user_id, name)
SELECT id, 'Inter' FROM users;

INSERT IGNORE INTO cards (user_id, name)
SELECT id, 'Mercado Pago' FROM users;

UPDATE transactions SET card = 'Nubank' WHERE card = 'nubank';
UPDATE transactions SET card = 'Inter' WHERE card = 'inter';
UPDATE transactions SET card = 'Mercado Pago' WHERE card = 'mercado_pago';
