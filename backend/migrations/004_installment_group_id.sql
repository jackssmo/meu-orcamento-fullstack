ALTER TABLE transactions
  ADD COLUMN installment_group_id VARCHAR(36) NULL;

CREATE INDEX idx_transactions_installment_group
  ON transactions(user_id, installment_group_id);
