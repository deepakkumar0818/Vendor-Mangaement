const RFQ         = require('../models/RFQ');
const RFQResponse = require('../models/RFQResponse');
const VendorProfile = require('../models/VendorProfile');
const User        = require('../models/User');
const { notifyVendorsOfRFQ } = require('../services/emailService');

// ── Create RFQ (client) ───────────────────────────────────────────────────────
// POST /api/rfq
const createRFQ = async (req, res) => {
    try {
        const { productName, category, quantity, deliveryLocation, deadline, description } = req.body;

        if (!productName || !category || !quantity || !deliveryLocation)
            return res.status(400).json({ message: 'productName, category, quantity, and deliveryLocation are required.' });

        const rfq = await RFQ.create({
            clientId: req.user._id,
            productName, category, quantity,
            deliveryLocation, deadline, description,
        });

        // Find vendors in this category and record them
        const matchingProfiles = await VendorProfile.find({
            categories: { $elemMatch: { $regex: new RegExp(category, 'i') } },
        }).select('userId');

        rfq.notifiedVendors = matchingProfiles.map(v => v.userId);
        await rfq.save();

        // Send email notifications to matching vendors
        if (matchingProfiles.length > 0) {
            const vendorUsers = await User.find({
                _id: { $in: rfq.notifiedVendors },
            }).select('name email');

            await notifyVendorsOfRFQ(
                vendorUsers.map(v => ({ name: v.name, email: v.email })),
                {
                    rfqNumber:        rfq.rfqNumber,
                    productName:      rfq.productName,
                    category:         rfq.category,
                    quantity:         rfq.quantity,
                    deliveryLocation: rfq.deliveryLocation,
                },
                { name: req.user.name, email: req.user.email }
            );
        }

        return res.status(201).json({
            rfq,
            notifiedVendors: matchingProfiles.length,
            message: `RFQ ${rfq.rfqNumber} created. ${matchingProfiles.length} vendor(s) in "${category}" have been notified.`,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Get client's RFQs ─────────────────────────────────────────────────────────
// GET /api/rfq
const getClientRFQs = async (req, res) => {
    try {
        const rfqs = await RFQ.find({ clientId: req.user._id }).sort('-createdAt');

        const enriched = await Promise.all(rfqs.map(async (rfq) => {
            const responseCount = await RFQResponse.countDocuments({ rfqId: rfq._id });
            return {
                ...rfq.toObject(),
                responseCount,
                status: rfq.status === 'open' && responseCount > 0 ? 'Responses Received' : rfq.status === 'open' ? 'Awaiting Responses' : rfq.status,
            };
        }));

        return res.json({ rfqs: enriched });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Get single RFQ ─────────────────────────────────────────────────────────────
// GET /api/rfq/:id
const getRFQById = async (req, res) => {
    try {
        const rfq = await RFQ.findById(req.params.id).populate('clientId', 'name email');
        if (!rfq)
            return res.status(404).json({ message: 'RFQ not found.' });

        // Only client who owns the RFQ can view it
        if (rfq.clientId._id.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Access denied.' });

        const responseCount = await RFQResponse.countDocuments({ rfqId: rfq._id });
        return res.json({
            rfq: {
                ...rfq.toObject(),
                responseCount,
                status: rfq.status === 'open' && responseCount > 0 ? 'Responses Received' : rfq.status === 'open' ? 'Awaiting Responses' : rfq.status,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Get responses to an RFQ ───────────────────────────────────────────────────
// GET /api/rfq/:id/responses
const getResponses = async (req, res) => {
    try {
        const rfq = await RFQ.findById(req.params.id);
        if (!rfq)
            return res.status(404).json({ message: 'RFQ not found.' });

        if (rfq.clientId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Access denied.' });

        const responses = await RFQResponse.find({ rfqId: rfq._id })
            .populate('vendorId', 'name email')
            .sort('price');

        const enriched = await Promise.all(responses.map(async (resp) => {
            const profile = await VendorProfile.findOne({ userId: resp.vendorId._id });
            return {
                ...resp.toObject(),
                vendor: resp.vendorId.name,
                vendorEmail: resp.vendorId.email,
                vendorRating: profile?.avgRating || 0,
                responseTime: new Date(resp.createdAt).toLocaleString(),
            };
        }));

        return res.json({ responses: enriched });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Comparison data ────────────────────────────────────────────────────────────
// GET /api/rfq/:id/comparison
const getComparison = async (req, res) => {
    try {
        const rfq = await RFQ.findById(req.params.id);
        if (!rfq)
            return res.status(404).json({ message: 'RFQ not found.' });

        if (rfq.clientId.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Access denied.' });

        const responses = await RFQResponse.find({ rfqId: rfq._id })
            .populate('vendorId', 'name email');

        let enriched = [];
        let dataSource = 'responses'; // track where data came from

        if (responses.length > 0) {
            // ── Use actual RFQ responses ──────────────────────────────────────
            enriched = await Promise.all(responses.map(async (resp) => {
                const profile = await VendorProfile.findOne({ userId: resp.vendorId._id });
                return {
                    vendor:          resp.vendorId.name,
                    price:           resp.price,
                    discount:        resp.discount,
                    effectivePrice:  Math.round(resp.price * (1 - resp.discount / 100) + resp.deliveryCharges),
                    deliveryTime:    resp.deliveryTime,
                    deliveryCharges: resp.deliveryCharges,
                    rating:          profile?.avgRating || 0,
                    paymentTerms:    resp.paymentTerms,
                    warranty:        resp.warranty,
                    message:         resp.message,
                    fromCatalog:     false,
                };
            }));
        } else {
            // ── Fall back: pull from vendor product catalogs in this category ─
            dataSource = 'catalog';
            const Product = require('../models/Product');

            // Find products whose category matches the RFQ category
            const categoryRegex = new RegExp(rfq.category, 'i');
            const catalogProducts = await Product.find({
                category: categoryRegex,
                isActive: true,
            }).populate('vendorId', 'name email').limit(20);

            // Also try matching by product name keywords if category products found < 3
            let allProducts = catalogProducts;
            if (catalogProducts.length < 3 && rfq.productName) {
                const nameWords = rfq.productName.split(/\s+/).filter(w => w.length > 2);
                const nameRegex = new RegExp(nameWords.join('|'), 'i');
                const nameProducts = await Product.find({
                    $or: [
                        { productName: nameRegex },
                        { category: categoryRegex },
                    ],
                    isActive: true,
                    _id: { $nin: catalogProducts.map(p => p._id) },
                }).populate('vendorId', 'name email').limit(10);
                allProducts = [...catalogProducts, ...nameProducts];
            }

            // Group by vendor — pick best-matching product per vendor
            const vendorMap = new Map();
            for (const product of allProducts) {
                const vid = product.vendorId._id.toString();
                if (!vendorMap.has(vid)) {
                    vendorMap.set(vid, product);
                } else {
                    // prefer product whose name is closer to rfq.productName
                    const existing = vendorMap.get(vid);
                    const rfqLower = rfq.productName.toLowerCase();
                    const existScore = existing.productName.toLowerCase().includes(rfqLower) ? 1 : 0;
                    const newScore   = product.productName.toLowerCase().includes(rfqLower) ? 1 : 0;
                    if (newScore > existScore) vendorMap.set(vid, product);
                }
            }

            enriched = await Promise.all([...vendorMap.values()].map(async (product) => {
                const profile = await VendorProfile.findOne({ userId: product.vendorId._id });
                return {
                    vendor:          product.vendorId.name,
                    price:           product.price,
                    discount:        product.discount || 0,
                    effectivePrice:  Math.round(product.price * (1 - (product.discount || 0) / 100) + (product.deliveryCharges || 0)),
                    deliveryTime:    product.leadTime || '7',
                    deliveryCharges: product.deliveryCharges || 0,
                    rating:          profile?.avgRating || 0,
                    paymentTerms:    'Net 30',
                    warranty:        product.warranty || '',
                    message:         '',
                    fromCatalog:     true,
                    productName:     product.productName,
                };
            }));

            if (!enriched.length)
                return res.json({ comparison: [], bests: null, recommended: null, dataSource });
        }

        const sorted = [...enriched].sort((a, b) => a.effectivePrice - b.effectivePrice);

        // Determine bests
        const bests = {
            price:    sorted[0]?.vendor,
            rating:   enriched.reduce((a, b) => a.rating > b.rating ? a : b)?.vendor,
            delivery: enriched.reduce((a, b) => parseInt(a.deliveryTime) < parseInt(b.deliveryTime) ? a : b)?.vendor,
        };

        // Composite recommendation: price 35%, rating 30%, delivery 25%, discount 10%
        const maxP = Math.max(...enriched.map(r => r.price));
        const minP = Math.min(...enriched.map(r => r.price));
        const maxD = Math.max(...enriched.map(r => parseInt(r.deliveryTime) || 0));
        const minD = Math.min(...enriched.map(r => parseInt(r.deliveryTime) || 0));

        const scored = enriched.map(r => {
            const priceScore    = maxP === minP ? 50 : ((maxP - r.price) / (maxP - minP)) * 100;
            const delivScore    = maxD === minD ? 50 : ((maxD - (parseInt(r.deliveryTime) || 0)) / (maxD - minD)) * 100;
            const ratingScore   = (r.rating / 5) * 100;
            const discountScore = r.discount;
            const total = priceScore * 0.35 + ratingScore * 0.30 + delivScore * 0.25 + discountScore * 0.10;
            return { ...r, score: Math.round(total) };
        });

        const recommended = scored.sort((a, b) => b.score - a.score)[0];

        return res.json({
            comparison: enriched,
            bests,
            recommended,
            dataSource,
            rfq: { rfqNumber: rfq.rfqNumber, productName: rfq.productName, category: rfq.category },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { createRFQ, getClientRFQs, getRFQById, getResponses, getComparison };
