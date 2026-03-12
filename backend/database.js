const { DatabaseSync } = require('node:sqlite');
const path             = require('path');

const DB_PATH = path.join(__dirname, 'vendor_management.db');
const db      = new DatabaseSync(DB_PATH);

// ── Create / migrate tables ───────────────────────────────────────────────────
db.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_name    TEXT    NOT NULL UNIQUE,
        contact_person TEXT,
        email          TEXT,
        phone          TEXT,
        category       TEXT    DEFAULT '',
        created_at     TEXT    DEFAULT (datetime('now')),
        updated_at     TEXT    DEFAULT (datetime('now'))
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

    CREATE TABLE IF NOT EXISTS rfqs (
        id           TEXT    PRIMARY KEY,
        client_name  TEXT    DEFAULT '',
        client_email TEXT    DEFAULT '',
        product      TEXT    NOT NULL,
        category     TEXT    NOT NULL,
        quantity     TEXT    NOT NULL,
        location     TEXT    NOT NULL,
        deadline     TEXT    DEFAULT '',
        notes        TEXT    DEFAULT '',
        status       TEXT    DEFAULT 'Awaiting Responses',
        created_at   TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rfq_responses (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        rfq_id         TEXT    NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        vendor_name    TEXT    NOT NULL,
        vendor_email   TEXT    DEFAULT '',
        price          REAL    NOT NULL,
        discount       REAL    DEFAULT 0,
        delivery_time  TEXT    DEFAULT '',
        freight        REAL    DEFAULT 0,
        warranty       TEXT    DEFAULT '',
        payment_terms  TEXT    DEFAULT '',
        notes          TEXT    DEFAULT '',
        created_at     TEXT    DEFAULT (datetime('now'))
    );
`);

// Add category column to existing vendors table if it doesn't exist yet
try { db.exec(`ALTER TABLE vendors ADD COLUMN category TEXT DEFAULT ''`); } catch (_) {}

// ── Vendor catalog ────────────────────────────────────────────────────────────

function upsertVendorCatalog(catalog) {
    const {
        vendor_name,
        contact_person = '',
        email          = '',
        phone          = '',
        category       = '',
        products       = [],
    } = catalog;

    const existing = db
        .prepare('SELECT id FROM vendors WHERE lower(vendor_name) = lower(?)')
        .get(vendor_name);

    let vendorId;
    if (existing) {
        vendorId = existing.id;
        db.prepare(
            `UPDATE vendors SET contact_person=?, email=?, phone=?, category=?, updated_at=datetime('now') WHERE id=?`
        ).run(contact_person, email, phone, category, vendorId);
        db.prepare('DELETE FROM products WHERE vendor_id=?').run(vendorId);
    } else {
        const r = db
            .prepare('INSERT INTO vendors (vendor_name, contact_person, email, phone, category) VALUES (?,?,?,?,?)')
            .run(vendor_name, contact_person, email, phone, category);
        vendorId = r.lastInsertRowid;
    }

    const ins = db.prepare(`
        INSERT INTO products
            (vendor_id, item_description, brand, specs, unit,
             price_per_unit, gst_percent, lead_time_days, warranty, stock_qty)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    `);
    for (const p of products) {
        ins.run(vendorId, p.item_description, p.brand ?? '', p.specs ?? '',
            p.unit ?? 'Nos', p.price_per_unit, p.gst_percent ?? 18,
            p.lead_time_days ?? 7, p.warranty ?? '1 Year', p.stock_qty ?? null);
    }
    return vendorId;
}

function queryProducts(search = null) {
    const sql = `
        SELECT p.*, v.vendor_name
        FROM   products p JOIN vendors v ON v.id = p.vendor_id
        ${search ? 'WHERE p.item_description LIKE ?' : ''}
        ORDER  BY p.item_description
    `;
    return search ? db.prepare(sql).all(`%${search}%`) : db.prepare(sql).all();
}

function listAllVendors() {
    const rows = db.prepare('SELECT * FROM vendors ORDER BY vendor_name').all();
    const cnt  = db.prepare('SELECT COUNT(*) as c FROM products WHERE vendor_id=?');
    return rows.map(v => ({
        vendor_id: v.id, vendor_name: v.vendor_name, contact_person: v.contact_person,
        email: v.email, phone: v.phone, category: v.category,
        product_count: cnt.get(v.id).c, created_at: v.created_at,
    }));
}

function getVendorsByCategory(category) {
    return db.prepare(
        `SELECT * FROM vendors WHERE lower(category) = lower(?) AND email != ''`
    ).all(category);
}

// ── RFQ ───────────────────────────────────────────────────────────────────────

function nextRfqId() {
    const row = db.prepare(`SELECT id FROM rfqs ORDER BY rowid DESC LIMIT 1`).get();
    if (!row) return 'RFQ-1001';
    const num = parseInt(row.id.replace('RFQ-', ''), 10);
    return `RFQ-${num + 1}`;
}

function createRFQ(data) {
    const id = nextRfqId();
    db.prepare(`
        INSERT INTO rfqs (id, client_name, client_email, product, category, quantity, location, deadline, notes)
        VALUES (?,?,?,?,?,?,?,?,?)
    `).run(id, data.client_name ?? '', data.client_email ?? '',
        data.product, data.category, data.quantity, data.location,
        data.deadline ?? '', data.notes ?? '');
    return id;
}

function listRFQs() {
    const rfqs = db.prepare('SELECT * FROM rfqs ORDER BY rowid DESC').all();
    const cnt  = db.prepare('SELECT COUNT(*) as c FROM rfq_responses WHERE rfq_id=?');
    return rfqs.map(r => ({
        ...r,
        response_count: cnt.get(r.id).c,
        status: cnt.get(r.id).c > 0 ? 'Responses Received' : 'Awaiting Responses',
    }));
}

function getRFQById(id) {
    const rfq = db.prepare('SELECT * FROM rfqs WHERE id=?').get(id);
    if (!rfq) return null;
    const responses = db.prepare(
        'SELECT * FROM rfq_responses WHERE rfq_id=? ORDER BY price ASC'
    ).all(id);
    return {
        ...rfq,
        status: responses.length > 0 ? 'Responses Received' : 'Awaiting Responses',
        responses,
    };
}

function respondToRFQ(rfqId, data) {
    db.prepare(`
        INSERT INTO rfq_responses
            (rfq_id, vendor_name, vendor_email, price, discount, delivery_time, freight, warranty, payment_terms, notes)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    `).run(rfqId, data.vendor_name, data.vendor_email ?? '',
        data.price, data.discount ?? 0, data.delivery_time ?? '',
        data.freight ?? 0, data.warranty ?? '', data.payment_terms ?? '', data.notes ?? '');
}

function getRFQsForVendorCategory(category) {
    return db.prepare(
        `SELECT r.*, (SELECT COUNT(*) FROM rfq_responses WHERE rfq_id = r.id) as response_count
         FROM rfqs r
         WHERE lower(r.category) = lower(?)
         ORDER BY r.rowid DESC`
    ).all(category);
}

function vendorAlreadyResponded(rfqId, vendorName) {
    const row = db.prepare(
        'SELECT id FROM rfq_responses WHERE rfq_id=? AND lower(vendor_name)=lower(?)'
    ).get(rfqId, vendorName);
    return !!row;
}

module.exports = {
    upsertVendorCatalog, queryProducts, listAllVendors, getVendorsByCategory,
    createRFQ, listRFQs, getRFQById, respondToRFQ, getRFQsForVendorCategory, vendorAlreadyResponded,
};
