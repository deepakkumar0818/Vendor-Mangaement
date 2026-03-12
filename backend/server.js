const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const XLSX    = require('xlsx');

const { upsertVendorCatalog, queryProducts, listAllVendors } = require('./database');
const { rankVendors } = require('./rankVendors');

const app    = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ message: 'Vendor Management API is running' });
});

// ── Excel-based rank-vendors ──────────────────────────────────────────────────
app.post('/api/rank-vendors', upload.single('file'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ detail: 'No file uploaded.' });

    if (!/\.(xlsx|xls)$/i.test(req.file.originalname))
        return res.status(400).json({ detail: 'Only Excel files (.xlsx / .xls) are supported.' });

    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const data     = XLSX.utils.sheet_to_json(sheet);

        if (!data.length)
            return res.status(400).json({ detail: 'Uploaded file is empty.' });

        res.json(rankVendors(data));
    } catch (e) {
        res.status(422).json({ detail: e.message });
    }
});

// ── Vendor Portal ─────────────────────────────────────────────────────────────

// POST — vendor submits their catalog
app.post('/api/vendor/catalog', (req, res) => {
    const catalog = req.body;

    if (!catalog?.vendor_name)
        return res.status(400).json({ detail: 'vendor_name is required.' });
    if (!catalog.products?.length)
        return res.status(400).json({ detail: 'At least one product is required.' });

    try {
        const vendorId = upsertVendorCatalog(catalog);
        res.json({ message: 'Catalog submitted successfully.', vendor_id: vendorId });
    } catch (e) {
        res.status(500).json({ detail: e.message });
    }
});

// GET — list all registered vendors
app.get('/api/vendor/catalog', (_req, res) => {
    res.json({ vendors: listAllVendors() });
});

// GET — all products with optional ?search= filter
app.get('/api/products', (req, res) => {
    res.json({ products: queryProducts(req.query.search || null) });
});

// ── Smart Quote ───────────────────────────────────────────────────────────────

app.post('/api/smart-quote', (req, res) => {
    const { items } = req.body;

    if (!items?.length)
        return res.status(400).json({ detail: 'No items provided.' });

    const allProducts  = queryProducts();
    const resultItems  = [];
    const vendorTotals = {};

    for (const reqItem of items) {
        const query   = reqItem.item_description.toLowerCase();
        const qty     = reqItem.qty;
        const target  = reqItem.target_price  ?? null;
        const custGst = reqItem.gst_percent   ?? null;

        const matched = allProducts.filter(p =>
            p.item_description.toLowerCase().includes(query)
        );

        if (!matched.length) {
            resultItems.push({
                item_description: reqItem.item_description,
                preferred_brand:  reqItem.preferred_brand || '',
                specs:            reqItem.specs            || '',
                unit:             reqItem.unit             || 'Nos',
                qty,
                target_price:     target,
                quotes:           [],
                best_vendor:      null,
                note:             'No vendor has listed this product yet.',
            });
            continue;
        }

        const quotes = matched.map(p => {
            const price   = parseFloat(p.price_per_unit);
            const gst     = custGst !== null ? custGst : parseFloat(p.gst_percent);
            const excl    = Math.round(price * qty    * 100) / 100;
            const gstAmt  = Math.round(excl  * gst / 100 * 100) / 100;
            const incl    = Math.round((excl + gstAmt) * 100) / 100;
            const variance = target !== null ? Math.round((price - target) * 100) / 100 : null;

            vendorTotals[p.vendor_name] = (vendorTotals[p.vendor_name] || 0) + incl;

            return {
                vendor_name:      p.vendor_name,
                item_description: p.item_description,
                brand:            p.brand  || '',
                specs:            p.specs  || '',
                unit:             p.unit   || 'Nos',
                price_per_unit:   price,
                gst_percent:      gst,
                total_excl_gst:   excl,
                gst_amount:       gstAmt,
                total_incl_gst:   incl,
                variance,
                lead_time_days:   p.lead_time_days,
                warranty:         p.warranty,
                stock_qty:        p.stock_qty,
            };
        });

        quotes.sort((a, b) => a.price_per_unit - b.price_per_unit);
        quotes.forEach((q, i) => { q.rank = i + 1; });

        resultItems.push({
            item_description: reqItem.item_description,
            preferred_brand:  reqItem.preferred_brand || '',
            specs:            reqItem.specs            || '',
            unit:             reqItem.unit             || 'Nos',
            qty,
            target_price:     target,
            gst_percent:      custGst,
            quotes,
            best_vendor:      quotes[0].vendor_name,
            best_price:       quotes[0].price_per_unit,
        });
    }

    const overall = Object.entries(vendorTotals)
        .map(([vendor_name, total_cost]) => ({
            vendor_name,
            total_cost: Math.round(total_cost * 100) / 100,
        }))
        .sort((a, b) => a.total_cost - b.total_cost)
        .map((v, i) => ({ ...v, rank: i + 1 }));

    res.json({ items: resultItems, overall_ranking: overall });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`\n  Vendor Management API  →  http://localhost:${PORT}\n`);
});
