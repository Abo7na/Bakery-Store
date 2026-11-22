-- Expand the starter schema to cover every current store and admin workflow.
-- Keep 0001_initial.sql immutable; this migration is additive for existing D1 databases.

PRAGMA foreign_keys = ON;

ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);
ALTER TABLE products ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));

ALTER TABLE orders ADD COLUMN subtotal REAL NOT NULL DEFAULT 0 CHECK (subtotal >= 0);
ALTER TABLE orders ADD COLUMN delivery_fee REAL NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0);
ALTER TABLE orders ADD COLUMN deferred INTEGER NOT NULL DEFAULT 0 CHECK (deferred IN (0, 1));
ALTER TABLE orders ADD COLUMN requested_time TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN preparation_minutes INTEGER NOT NULL DEFAULT 0 CHECK (preparation_minutes >= 0);
ALTER TABLE orders ADD COLUMN estimated_ready_at TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN rejection_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN customer_notice TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN stock_deducted INTEGER NOT NULL DEFAULT 0 CHECK (stock_deducted IN (0, 1));
ALTER TABLE orders ADD COLUMN stock_restored INTEGER NOT NULL DEFAULT 0 CHECK (stock_restored IN (0, 1));
ALTER TABLE orders ADD COLUMN ready_at TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN delivered_at TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN cancelled_at TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN cancellation_reason TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL,
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total REAL NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS product_stock_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL,
  movement_type TEXT NOT NULL,
  quantity REAL NOT NULL CHECK (quantity >= 0),
  before_quantity REAL NOT NULL,
  after_quantity REAL NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  reference TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS direct_sales (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  shop_name TEXT NOT NULL DEFAULT '',
  exchange_rate REAL NOT NULL DEFAULT 0 CHECK (exchange_rate >= 0),
  customer TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  payment TEXT NOT NULL DEFAULT 'cash',
  note TEXT NOT NULL DEFAULT '',
  total REAL NOT NULL CHECK (total >= 0),
  voided_at TEXT NOT NULL DEFAULT '',
  void_reason TEXT NOT NULL DEFAULT '',
  returned_at TEXT NOT NULL DEFAULT '',
  return_id TEXT NOT NULL DEFAULT '',
  returned_amount REAL NOT NULL DEFAULT 0 CHECK (returned_amount >= 0)
);

CREATE TABLE IF NOT EXISTS direct_sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id TEXT NOT NULL REFERENCES direct_sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL,
  unit_price REAL NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total REAL NOT NULL CHECK (line_total >= 0)
);

CREATE TABLE IF NOT EXISTS direct_sale_returns (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL REFERENCES direct_sales(id),
  invoice_number TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  payment TEXT NOT NULL DEFAULT 'cash',
  refund_method TEXT NOT NULL DEFAULT 'cash',
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  refund_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS direct_sale_return_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  return_id TEXT NOT NULL REFERENCES direct_sale_returns(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL,
  unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS raw_materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity REAL NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  minimum REAL NOT NULL DEFAULT 0 CHECK (minimum >= 0),
  unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  price_currency TEXT NOT NULL DEFAULT 'SYP' CHECK (price_currency IN ('SYP', 'USD')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS raw_material_movements (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL DEFAULT '',
  material_name TEXT NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('add', 'remove', 'set')),
  quantity REAL NOT NULL CHECK (quantity >= 0),
  unit TEXT NOT NULL DEFAULT '',
  before_quantity REAL NOT NULL,
  after_quantity REAL NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  purchase_total REAL,
  purchase_currency TEXT NOT NULL DEFAULT '',
  purchase_unit_price REAL,
  stock_valuation_unit_price REAL,
  stock_valuation_total REAL,
  invoice_id TEXT NOT NULL DEFAULT '',
  supplier_id TEXT NOT NULL DEFAULT '',
  return_id TEXT NOT NULL DEFAULT '',
  return_void INTEGER NOT NULL DEFAULT 0 CHECK (return_void IN (0, 1))
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_invoices (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  material_id TEXT NOT NULL DEFAULT '',
  material_name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  invoice_number TEXT NOT NULL DEFAULT '',
  invoice_date TEXT NOT NULL,
  quantity REAL NOT NULL CHECK (quantity > 0),
  total REAL NOT NULL CHECK (total >= 0),
  paid REAL NOT NULL DEFAULT 0 CHECK (paid >= 0),
  due REAL NOT NULL DEFAULT 0 CHECK (due >= 0),
  supplier_credit REAL NOT NULL DEFAULT 0 CHECK (supplier_credit >= 0),
  currency TEXT NOT NULL DEFAULT 'SYP' CHECK (currency IN ('SYP', 'USD')),
  notes TEXT NOT NULL DEFAULT '',
  unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  returned_quantity REAL NOT NULL DEFAULT 0 CHECK (returned_quantity >= 0),
  returned_total REAL NOT NULL DEFAULT 0 CHECK (returned_total >= 0),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_invoice_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id TEXT NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  amount REAL NOT NULL CHECK (amount >= 0),
  payment_date TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SYP' CHECK (currency IN ('SYP', 'USD')),
  kind TEXT NOT NULL DEFAULT 'payment',
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  voided_at TEXT NOT NULL DEFAULT '',
  void_reason TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS supplier_returns (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES purchase_invoices(id),
  invoice_number TEXT NOT NULL DEFAULT '',
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  supplier_name TEXT NOT NULL DEFAULT '',
  material_id TEXT NOT NULL DEFAULT '',
  material_name TEXT NOT NULL,
  quantity REAL NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT '',
  unit_price REAL NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  amount REAL NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'SYP' CHECK (currency IN ('SYP', 'USD')),
  return_date TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  voided_at TEXT NOT NULL DEFAULT '',
  void_reason TEXT NOT NULL DEFAULT '',
  void_stock_before REAL,
  void_stock_after REAL
);

CREATE TABLE IF NOT EXISTS supplier_recoveries (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES purchase_invoices(id),
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  invoice_number TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'SYP' CHECK (currency IN ('SYP', 'USD')),
  recovery_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  voided_at TEXT NOT NULL DEFAULT '',
  void_reason TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS supplier_credit_applications (
  id TEXT PRIMARY KEY,
  supplier_id TEXT NOT NULL REFERENCES suppliers(id),
  source_invoice_id TEXT NOT NULL REFERENCES purchase_invoices(id),
  source_invoice_number TEXT NOT NULL DEFAULT '',
  target_invoice_id TEXT NOT NULL REFERENCES purchase_invoices(id),
  target_invoice_number TEXT NOT NULL DEFAULT '',
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'SYP' CHECK (currency IN ('SYP', 'USD')),
  applied_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  voided_at TEXT NOT NULL DEFAULT '',
  void_reason TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS operation_audit_log (
  id TEXT PRIMARY KEY,
  operation_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS api_idempotency (
  idempotency_key TEXT PRIMARY KEY,
  operation_type TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_movements_product_date ON product_stock_movements(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_direct_sales_created_at ON direct_sales(created_at);
CREATE INDEX IF NOT EXISTS idx_direct_sale_items_sale_id ON direct_sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_direct_sale_returns_sale_id ON direct_sale_returns(sale_id);
CREATE INDEX IF NOT EXISTS idx_raw_material_movements_material_date ON raw_material_movements(material_id, created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_supplier_date ON purchase_invoices(supplier_id, invoice_date);
CREATE INDEX IF NOT EXISTS idx_purchase_invoice_payments_invoice ON purchase_invoice_payments(invoice_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_supplier_returns_invoice ON supplier_returns(invoice_id, return_date);
CREATE INDEX IF NOT EXISTS idx_supplier_recoveries_invoice ON supplier_recoveries(invoice_id, recovery_date);
CREATE INDEX IF NOT EXISTS idx_supplier_credit_source ON supplier_credit_applications(source_invoice_id);
CREATE INDEX IF NOT EXISTS idx_supplier_credit_target ON supplier_credit_applications(target_invoice_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchase_invoice_number
  ON purchase_invoices(supplier_id, invoice_number)
  WHERE invoice_number <> '';
