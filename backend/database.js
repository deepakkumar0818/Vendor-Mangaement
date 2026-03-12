// Uses Node.js built-in SQLite (available in Node 22+) — no native compilation needed
const { DatabaseSync } = require('node:sqlite');
const path             = require('path');

const DB_PATH = path.join(__dirname, 'vendor_management.db');
const db      = new DatabaseSync(DB_PATH);

// ── Create tables ─────────────────────────────────────────────────────────────
db.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_name    TEXT    NOT NULL UNIQUE,
        contact_person TEXT,
        email          TEXT,
        phone          TEXT,
        created_at     TEXT DEFAULT (datetime('now')),
        updated_at     TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
        id               INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_id        INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        item_description TEXT    NOT NULL,
        brand            TEXT,
        specs            TEXT,
        unit             TEXT    DEFAULT 'Nos',
        price_per_unit   REAL    NOT NULL,
        gst_percent      REAL    DEFAULT 18.0,
        lead_time_days   INTEGER DEFAULT 7,
        warranty         TEXT    DEFAULT '1 Year',
        stock_qty        INTEGER,
        created_at       TEXT    DEFAULT (datetime('now'))
    );
`);

// ── Upsert vendor catalog ─────────────────────────────────────────────────────
function upsertVendorCatalog(catalog) {
    const {
        vendor_name,
        contact_person = '',
        email          = '',
        phone          = '',
        products       = [],
    } = catalog;

    // Check if vendor already exists
    const existing = db
        .prepare('SELECT id FROM vendors WHERE lower(vendor_name) = lower(?)')
        .get(vendor_name);

    let vendorId;

    if (existing) {
        vendorId = existing.id;
        db.prepare(
            `UPDATE vendors SET contact_person=?, email=?, phone=?, updated_at=datetime('now') WHERE id=?`
        ).run(contact_person, email, phone, vendorId);
        db.prepare('DELETE FROM products WHERE vendor_id=?').run(vendorId);
    } else {
        const result = db
            .prepare('INSERT INTO vendors (vendor_name, contact_person, email, phone) VALUES (?,?,?,?)')
            .run(vendor_name, contact_person, email, phone);
        vendorId = result.lastInsertRowid;
    }

    const insertProduct = db.prepare(`
        INSERT INTO products
            (vendor_id, item_description, brand, specs, unit,
             price_per_unit, gst_percent, lead_time_days, warranty, stock_qty)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    `);

    for (const p of products) {
        insertProduct.run(
            vendorId,
            p.item_description,
            p.brand          ?? '',
            p.specs          ?? '',
            p.unit           ?? 'Nos',
            p.price_per_unit,
            p.gst_percent    ?? 18.0,
            p.lead_time_days ?? 7,
            p.warranty       ?? '1 Year',
            p.stock_qty      ?? null,
        );
    }

    return vendorId;
}

// ── Query products ────────────────────────────────────────────────────────────
function queryProducts(search = null) {
    const sql = `
        SELECT p.*, v.vendor_name
        FROM   products p
        JOIN   vendors  v ON v.id = p.vendor_id
        ${search ? "WHERE p.item_description LIKE ?" : ""}
        ORDER  BY p.item_description
    `;
    return search
        ? db.prepare(sql).all(`%${search}%`)
        : db.prepare(sql).all();
}

// ── List all vendors ──────────────────────────────────────────────────────────
function listAllVendors() {
    const vendors = db.prepare('SELECT * FROM vendors ORDER BY vendor_name').all();
    const countStmt = db.prepare('SELECT COUNT(*) as c FROM products WHERE vendor_id=?');
    return vendors.map(v => ({
        vendor_id:      v.id,
        vendor_name:    v.vendor_name,
        contact_person: v.contact_person,
        email:          v.email,
        phone:          v.phone,
        product_count:  countStmt.get(v.id).c,
        created_at:     v.created_at,
    }));
}

module.exports = { upsertVendorCatalog, queryProducts, listAllVendors };
