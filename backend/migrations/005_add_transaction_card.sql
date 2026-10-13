ALTER TABLE transactions
  ADD COLUMN card ENUM('nubank', 'inter', 'mercado_pago') NULL AFTER category;
