const VendorProfile = require('../models/VendorProfile');
const Product       = require('../models/Product');
const RFQ           = require('../models/RFQ');
const RFQResponse   = require('../models/RFQResponse');
const Rating        = require('../models/Rating');
const multer        = require('multer');
const path          = require('path');

// ── File upload config ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
    },
});

// ── Vendor Profile ────────────────────────────────────────────────────────────

// GET /api/vendor/profile
const getProfile = async (req, res) => {
    try {
        const profile = await VendorProfile.findOne({ userId: req.user._id });
        if (!profile)
            return res.status(404).json({ message: 'Vendor profile not found.' });
        return res.json({ profile });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/vendor/profile
const updateProfile = async (req, res) => {
    try {
        const { companyName, description, location, phone, categories } = req.body;

        const profile = await VendorProfile.findOneAndUpdate(
            { userId: req.user._id },
            { companyName, description, location, phone, categories },
            { new: true, upsert: true, runValidators: true }
        );
        return res.json({ profile });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Products ──────────────────────────────────────────────────────────────────

// POST /api/vendor/products
const addProduct = async (req, res) => {
    try {
        const { productName, category, price, discount, deliveryCharges, stock, leadTime, description, gstPercent, unit, warranty } = req.body;

        if (!productName || !category || price === undefined)
            return res.status(400).json({ message: 'productName, category, and price are required.' });

        const product = await Product.create({
            vendorId: req.user._id,
            productName, category, price, discount, deliveryCharges,
            stock, leadTime, description, gstPercent, unit, warranty,
            imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
        });
        return res.status(201).json({ product });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// GET /api/vendor/products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ vendorId: req.user._id, isActive: true }).sort('-createdAt');
        return res.json({ products });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// PUT /api/vendor/products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user._id },
            { ...req.body, imageUrl: req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl },
            { new: true, runValidators: true }
        );
        if (!product)
            return res.status(404).json({ message: 'Product not found.' });
        return res.json({ product });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// DELETE /api/vendor/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, vendorId: req.user._id },
            { isActive: false },
            { new: true }
        );
        if (!product)
            return res.status(404).json({ message: 'Product not found.' });
        return res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Vendor Dashboard ──────────────────────────────────────────────────────────

// GET /api/vendor/dashboard
const getDashboard = async (req, res) => {
    try {
        const vendorId = req.user._id;

        const profile = await VendorProfile.findOne({ userId: vendorId });

        // RFQs matching vendor's categories
        const categories = profile?.categories || [];
        const rfqsQuery  = categories.length > 0
            ? { category: { $in: categories.map(c => new RegExp(c, 'i')) } }
            : {};

        const [rfqsReceived, quotationsSubmitted, productCount, ratings] = await Promise.all([
            RFQ.countDocuments(rfqsQuery),
            RFQResponse.countDocuments({ vendorId }),
            Product.countDocuments({ vendorId, isActive: true }),
            Rating.find({ vendorId }).select('rating'),
        ]);

        const ordersWon      = Math.round(quotationsSubmitted * 0.64); // ~64% conversion (mock)
        const avgRating      = ratings.length ? (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1) : profile?.avgRating || 0;
        const pendingRFQs    = await RFQ.countDocuments({ ...rfqsQuery, status: 'open' });
        const revenue        = `₹${(ordersWon * 1.8).toFixed(1)} L`; // placeholder calc

        return res.json({
            rfqsReceived,
            quotationsSubmitted,
            ordersWon,
            revenue,
            avgRating: parseFloat(avgRating),
            totalReviews:   ratings.length,
            productCount,
            pendingRFQs,
            conversionRate: quotationsSubmitted > 0 ? `${Math.round((ordersWon / quotationsSubmitted) * 100)}%` : '0%',
            avgResponseTime: profile?.responseTime || '—',
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Vendor RFQs ───────────────────────────────────────────────────────────────

// GET /api/vendor/rfq
const getVendorRFQs = async (req, res) => {
    try {
        const profile    = await VendorProfile.findOne({ userId: req.user._id });
        const categories = profile?.categories || [];

        const filter = categories.length > 0
            ? { category: { $in: categories.map(c => new RegExp(c, 'i')), }, status: 'open' }
            : { status: 'open' };

        const rfqs = await RFQ.find(filter)
            .populate('clientId', 'name email')
            .sort('-createdAt')
            .limit(50);

        // Attach response count and whether this vendor already responded
        const enriched = await Promise.all(rfqs.map(async (rfq) => {
            const responseCount = await RFQResponse.countDocuments({ rfqId: rfq._id });
            const myResponse    = await RFQResponse.findOne({ rfqId: rfq._id, vendorId: req.user._id });
            return {
                ...rfq.toObject(),
                responseCount,
                alreadyResponded: !!myResponse,
            };
        }));

        return res.json({ rfqs: enriched });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// POST /api/vendor/rfq/:rfqId/respond
const respondToRFQ = async (req, res) => {
    try {
        const { rfqId } = req.params;
        const { price, discount, deliveryTime, deliveryCharges, message, paymentTerms, warranty } = req.body;

        if (!price)
            return res.status(400).json({ message: 'Price is required.' });

        const rfq = await RFQ.findById(rfqId);
        if (!rfq)
            return res.status(404).json({ message: 'RFQ not found.' });
        if (rfq.status !== 'open')
            return res.status(400).json({ message: 'This RFQ is no longer accepting responses.' });

        const existing = await RFQResponse.findOne({ rfqId, vendorId: req.user._id });
        if (existing)
            return res.status(409).json({ message: 'You have already responded to this RFQ.' });

        const response = await RFQResponse.create({
            rfqId, vendorId: req.user._id,
            price, discount, deliveryTime, deliveryCharges,
            message, paymentTerms, warranty,
        });

        return res.status(201).json({ response, message: 'Quotation submitted successfully.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    upload,
    getProfile, updateProfile,
    addProduct, getProducts, updateProduct, deleteProduct,
    getDashboard,
    getVendorRFQs, respondToRFQ,
};
