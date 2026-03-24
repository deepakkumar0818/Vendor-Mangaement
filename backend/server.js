const dotenv = require('dotenv');
dotenv.config();

const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const multer    = require('multer');
const XLSX      = require('xlsx');
const connectDB = require('./config/db');

const authRoutes    = require('./routes/auth');
const vendorsRoutes = require('./routes/vendors');
const vendorRoutes  = require('./routes/vendor');
const rfqRoutes     = require('./routes/rfq');
const clientRoutes  = require('./routes/client');

let upsertVendorCatalog, queryProducts, listAllVendors;
let sqliteReady = false;
try {
    const db = require('./database');
    upsertVendorCatalog = db.upsertVendorCatalog;
    queryProducts       = db.queryProducts;
    listAllVendors      = db.listAllVendors;
    sqliteReady = true;
} catch (e) {
    console.warn('⚠️  SQLite legacy routes disabled:', e.message);
}

let rankVendors;
try {
    rankVendors = require('./rankVendors').rankVendors;
} catch (e) {
    console.warn('⚠️  rankVendors disabled:', e.message);
}

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => res.json({ message: 'VMS API v2.0 running' }));

app.use('/api/auth',    authRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/vendor',  vendorRoutes);
app.use('/api/rfq',     rfqRoutes);
app.use('/api/client',  clientRoutes);

if (rankVendors) {
    const upload = multer({ storage: multer.memoryStorage() });
    app.post('/api/rank-vendors', upload.single('file'), (req, res) => {
        if (!req.file) return res.status(400).json({ detail: 'No file uploaded.' });
        if (!/\.(xlsx|xls)$/i.test(req.file.originalname))
            return res.status(400).json({ detail: 'Only Excel files are supported.' });
        try {
            const wb   = XLSX.read(req.file.buffer, { type: 'buffer' });
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            if (!data.length) return res.status(400).json({ detail: 'Empty file.' });
            res.json(rankVendors(data));
        } catch (e) { res.status(422).json({ detail: e.message }); }
    });
}

if (sqliteReady) {
    app.post('/api/legacy/catalog', async (req, res) => {
        const catalog = req.body;
        if (!catalog?.vendor_name) return res.status(400).json({ detail: 'vendor_name required.' });
        if (!catalog.products?.length) return res.status(400).json({ detail: 'At least one product required.' });
        try {
            const vendorId = await upsertVendorCatalog(catalog);
            res.json({ message: 'Catalog submitted successfully.', vendor_id: vendorId });
        } catch (e) { res.status(500).json({ detail: e.message }); }
    });

    app.get('/api/legacy/catalog', async (_req, res) => {
        try { res.json({ vendors: await listAllVendors() }); }
        catch (err) { res.status(500).json({ detail: err.message }); }
    });

    app.get('/api/legacy/products', async (req, res) => {
        try { res.json({ products: await queryProducts(req.query.search || null) }); }
        catch (err) { res.status(500).json({ detail: err.message }); }
    });
}

// ── 404 & error handlers ──────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }));
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ message: err.message || 'Internal server error.' }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`\n🚀 VMS API → http://localhost:${PORT}\n`));
