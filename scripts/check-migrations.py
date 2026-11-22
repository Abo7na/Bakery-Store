#!/usr/bin/env python3
"""Validate every additive SQLite migration against a clean database."""
from pathlib import Path
import sqlite3

ROOT = Path(__file__).resolve().parents[1]
MIGRATIONS = sorted((ROOT / "migrations").glob("[0-9]*.sql"))
if not MIGRATIONS:
    raise SystemExit("No SQL migrations found")

db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys = ON")
for migration in MIGRATIONS:
    db.executescript(migration.read_text(encoding="utf-8"))

expected = {
    "products", "orders", "order_items", "product_stock_movements",
    "direct_sales", "direct_sale_items", "direct_sale_returns",
    "direct_sale_return_items", "raw_materials", "raw_material_movements",
    "suppliers", "purchase_invoices", "purchase_invoice_payments",
    "supplier_returns", "supplier_recoveries",
    "supplier_credit_applications", "settings", "operation_audit_log",
    "api_idempotency",
}
actual = {
    row[0] for row in db.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    )
}
missing = sorted(expected - actual)
if missing:
    raise SystemExit(f"Missing tables: {', '.join(missing)}")

product_columns = {row[1] for row in db.execute("PRAGMA table_info(products)")}
if not {"stock", "image", "price", "active"} <= product_columns:
    raise SystemExit("Products table is missing required catalog or stock columns")

# Exercise core relationships and verify that invalid stock cannot be stored.
db.execute(
    "INSERT INTO products(id, name, price, stock) VALUES ('p1', 'Test product', 10, 5)"
)
db.execute(
    "INSERT INTO orders(id, customer, phone, fulfillment, total, items_json) "
    "VALUES ('o1', 'Test', '000', 'pickup', 20, '[]')"
)
db.execute(
    "INSERT INTO order_items(order_id, product_id, product_name, unit_price, quantity, line_total) "
    "VALUES ('o1', 'p1', 'Test product', 10, 2, 20)"
)
db.execute(
    "INSERT INTO suppliers(id, name, created_at) VALUES ('s1', 'Test supplier', '2026-01-01')"
)
db.execute(
    "INSERT INTO raw_materials(id, name, unit) VALUES ('m1', 'Flour', 'kg')"
)
db.execute(
    "INSERT INTO purchase_invoices(id, supplier_id, material_id, material_name, invoice_date, quantity, total, created_at) "
    "VALUES ('i1', 's1', 'm1', 'Flour', '2026-01-01', 10, 100, '2026-01-01')"
)
db.execute(
    "INSERT INTO purchase_invoice_payments(invoice_id, amount, payment_date) "
    "VALUES ('i1', 25, '2026-01-01')"
)
db.execute(
    "INSERT INTO direct_sales(id, invoice_number, created_at, total) "
    "VALUES ('d1', 'INV-TEST', '2026-01-01', 10)"
)
db.execute(
    "INSERT INTO direct_sale_items(sale_id, product_id, product_name, unit_price, quantity, line_total) "
    "VALUES ('d1', 'p1', 'Test product', 10, 1, 10)"
)

try:
    db.execute("UPDATE products SET stock = -1 WHERE id = 'p1'")
except sqlite3.IntegrityError:
    pass
else:
    raise SystemExit("Products stock constraint did not reject a negative balance")

foreign_key_errors = db.execute("PRAGMA foreign_key_check").fetchall()
if foreign_key_errors:
    raise SystemExit(f"Foreign-key violations: {foreign_key_errors}")

print(f"Validated {len(MIGRATIONS)} migrations and {len(expected)} required tables.")
