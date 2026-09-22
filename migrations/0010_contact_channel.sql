-- Предпочтительный канал связи в заявке
ALTER TABLE orders ADD COLUMN contact_channel TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN contact_handle TEXT NOT NULL DEFAULT '';
