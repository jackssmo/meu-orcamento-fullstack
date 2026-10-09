CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_user_type_date ON transactions(user_id, type, date);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category);
