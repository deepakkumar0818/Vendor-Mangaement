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

        if (!responses.length)
            return res.json({ comparison: [], bests: null, recommended: null });

        const enriched = await Promise.all(responses.map(async (resp) => {
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
            };
        }));

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
            rfq: { rfqNumber: rfq.rfqNumber, productName: rfq.productName, category: rfq.category },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { createRFQ, getClientRFQs, getRFQById, getResponses, getComparison };
