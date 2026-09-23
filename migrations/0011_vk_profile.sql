-- Профиль VK ID покупателя (опционально — гостевой заказ без входа сохраняется)
ALTER TABLE orders ADD COLUMN vk_user_id TEXT;
ALTER TABLE orders ADD COLUMN vk_first_name TEXT;
ALTER TABLE orders ADD COLUMN vk_last_name TEXT;
ALTER TABLE orders ADD COLUMN vk_avatar_url TEXT;
ALTER TABLE orders ADD COLUMN vk_profile_url TEXT;
