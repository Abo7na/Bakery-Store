PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS products (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 category TEXT NOT NULL DEFAULT 'أخرى',
 price REAL NOT NULL CHECK(price >= 0),
 description TEXT NOT NULL DEFAULT '',
 image TEXT NOT NULL DEFAULT '',
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY,
 customer TEXT NOT NULL,
 phone TEXT NOT NULL,
 fulfillment TEXT NOT NULL CHECK(fulfillment IN ('pickup','delivery')),
 address TEXT NOT NULL DEFAULT '',
 payment TEXT NOT NULL DEFAULT 'cash',
 transaction_ref TEXT NOT NULL DEFAULT '',
 notes TEXT NOT NULL DEFAULT '',
 total REAL NOT NULL CHECK(total >= 0),
 status TEXT NOT NULL DEFAULT 'قيد التأكيد',
 items_json TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
 key TEXT PRIMARY KEY,
 value TEXT NOT NULL
);
INSERT OR IGNORE INTO settings(key,value) VALUES
 ('shop_name','مخبوزات الشام'),
 ('delivery_fee','1'),
 ('currency_rate','14500'),
 ('sham_cash','');
