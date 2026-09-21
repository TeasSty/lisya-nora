-- price_rub was added to 0001_init.sql after some local DBs already applied the
-- older products schema. Add the column for those databases (no-op if already present
-- is not possible in SQLite ALTER, so this is safe only when column is missing).
ALTER TABLE products ADD COLUMN price_rub INTEGER;
