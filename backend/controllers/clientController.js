const User          = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Product       = require('../models/Product');
const RFQ           = require('../models/RFQ');
const RFQResponse   = require('../models/RFQResponse');
const Rating        = require('../models/Rating');

// ── Vendor Marketplace ────────────────────────────────────────────────────────
// GET /api/vendors?search=&category=&minRating=&sort=
const getVendors = async (req, res) => {
    try {
        const { search, category, minRating, sort = 'rating' } = req.query;

        // Build profile filter
        const profileFilter = { isActive: true };
        if (category && category !== 'All Categories')
            profileFilter.categories = { $elemMatch: { $regex: new RegExp(category, 'i') } };
        if (minRating)
            profileFilter.avgRating = { $gte: parseFloat(minRating) };

        let profiles = await VendorProfile.find(profileFilter)
            .populate('userId', 'name email createdAt');

        if (!profiles) return res.json({ vendors: [] });

        // Search by vendor name or product
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();

            // Also search products
            const matchingProducts = await Product.find({
                $or: [
                    { productName: { $regex: q, $options: 'i' } },
                    { category:    { $regex: q, $options: 'i' } },
                ],
                isActive: true,
            }).distinct('vendorId');

            profiles = profiles.filter(p =>
                p.userId?.name?.toLowerCase().includes(q) ||
                p.companyName?.toLowerCase().includes(q) ||
                p.categories?.some(c => c.toLowerCase().includes(q)) ||
                matchingProducts.some(vid => vid.toString() === p.userId?._id?.toString())
            );
        }

        // Enrich each profile with products
        const vendors = await Promise.all(profiles.map(async (p) => {
            const products = await Product.find({ vendorId: p.userId._id, isActive: true })
                .select('productName').limit(5);
            return {
                _id:                 p.userId._id,
                name:                p.companyName || p.userId.name,
                email:               p.userId.email,
                category:            p.categories?.[0] || 'General',
                categories:          p.categories,
                products:            products.map(pr => pr.productName),
                rating:              p.avgRating,
                reviews:             p.totalReviews,
                location:            p.location || 'India',
                responseTime:        p.responseTime || '—',
                deliveryReliability: p.deliveryReliability,
                orderSuccess:        p.orderSuccess,
                satisfaction:        p.satisfaction,
                priceScore:          p.priceScore,
                badge:               p.badge,
                description:         p.description,
                phone:               p.phone,
            };
        }));

        // Sort
        vendors.sort((a, b) => {
            if (sort === 'rating')   return b.rating - a.rating;
            if (sort === 'response') return (parseInt(a.responseTime) || 99) - (parseInt(b.responseTime) || 99);
            if (sort === 'delivery') return b.deliveryReliability - a.deliveryReliability;
            if (sort === 'price')    return b.priceScore - a.priceScore;
            return 0;
        });

        return res.json({ vendors });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Get single vendor profile ─────────────────────────────────────────────────
// GET /api/vendors/:id
const getVendorById = async (req, res) => {
    try {
        const profile = await VendorProfile.findOne({ userId: req.params.id })
            .populate('userId', 'name email createdAt');

        if (!profile)
            return res.status(404).json({ message: 'Vendor not found.' });

        const products = await Product.find({ vendorId: req.params.id, isActive: true })
            .select('productName category price discount deliveryCharges stock leadTime');

        const ratings = await Rating.find({ vendorId: req.params.id })
            .populate('clientId', 'name')
            .sort('-createdAt')
            .limit(10);

        return res.json({
            vendor: {
                _id:                 profile.userId._id,
                name:                profile.companyName || profile.userId.name,
                email:               profile.userId.email,
                categories:          profile.categories,
                products:            products.map(p => p.productName),
                productDetails:      products,
                rating:              profile.avgRating,
                reviews:             profile.totalReviews,
                location:            profile.location,
                phone:               profile.phone,
                responseTime:        profile.responseTime,
                deliveryReliability: profile.deliveryReliability,
                orderSuccess:        profile.orderSuccess,
                satisfaction:        profile.satisfaction,
                priceScore:          profile.priceScore,
                description:         profile.description,
                badge:               profile.badge,
                ratings:             ratings.map(r => ({
                    author:  r.clientId?.name || 'Anonymous',
                    rating:  r.rating,
                    quality: r.quality,
                    delivery:r.delivery,
                    price:   r.price,
                    communication: r.communication,
                    review:  r.review,
                    date:    r.createdAt.toISOString().split('T')[0],
                })),
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// ── Client Dashboard ──────────────────────────────────────────────────────────
// GET /api/client/dashboard
const getDashboard = async (req, res) => {
    try {
        const clientId = req.user._id;

        const [rfqsSent, quotesReceived, vendorsAvailable] = await Promise.all([
            RFQ.countDocuments({ clientId }),
            RFQResponse.countDocuments({
                rfqId: { $in: await RFQ.find({ clientId }).distinct('_id') },
            }),
            VendorProfile.countDocuments({ isActive: true }),
        ]);

        const recentRFQs = await RFQ.find({ clientId }).sort('-createdAt').limit(5);

        const recentActivity = await Promise.all(recentRFQs.map(async rfq => {
            const rc = await RFQResponse.countDocuments({ rfqId: rfq._id });
            return {
                action: rc > 0
                    ? `${rfq.rfqNumber}: ${rc} quote(s) received for ${rfq.productName}`
                    : `${rfq.rfqNumber} sent — awaiting vendor responses`,
                time:   timeAgo(rfq.createdAt),
                type:   rc > 0 ? 'quote' : 'rfq',
            };
        }));

        return res.json({
            rfqsSent,
            quotesReceived,
            vendorsAvailable,
            costSavings: '₹38.4 L', // placeholder — will be calculated from awarded orders
            recentActivity,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'Yesterday';
    return `${d} days ago`;
}

module.exports = { getVendors, getVendorById, getDashboard };
