-- Поля для оформления Ozon-доставки и трек-номера
ALTER TABLE orders ADD COLUMN city TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN address TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN pickup_point TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN tracking_number TEXT NOT NULL DEFAULT '';
