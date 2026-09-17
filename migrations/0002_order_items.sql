-- Multi-item orders: JSON array of { productId, productName, priceRub }
-- Legacy product_id / product_name remain for backward compatibility.
ALTER TABLE orders ADD COLUMN items_json TEXT;
