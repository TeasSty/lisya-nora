-- Несколько фото товара (карусель): JSON-массив URL рядом с основным image_url.
ALTER TABLE products ADD COLUMN image_urls TEXT;

-- Заполняем image_urls из image_url для существующих строк (один элемент).
UPDATE products
SET image_urls = CASE
  WHEN image_url IS NULL OR trim(image_url) = '' THEN NULL
  ELSE json_array(image_url)
END
WHERE image_urls IS NULL;
