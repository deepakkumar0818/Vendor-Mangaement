const Rating        = require('../models/Rating');
const VendorProfile = require('../models/VendorProfile');

// ── Submit / update rating ────────────────────────────────────────────────────
// POST /api/vendors/:id/ratings
const rateVendor = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const clientId = req.user._id;
        const { rating, quality, delivery, price, communication, review, rfqId } = req.body;

        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });

        // Upsert — one review per client per vendor
        const doc = await Rating.findOneAndUpdate(
            { vendorId, clientId },
            { rating, quality, delivery, price, communication, review, rfqId: rfqId || null },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        // Recalculate vendor's average rating
        const allRatings = await Rating.find({ vendorId });
        const avgRating  = allRatings.reduce((a, r) => a + r.rating, 0) / allRatings.length;

        await VendorProfile.findOneAndUpdate(
            { userId: vendorId },
            {
                avgRating:    parseFloat(avgRating.toFixed(1)),
                totalReviews: allRatings.length,
            }
        );

        return res.status(201).json({ rating: doc, message: 'Review submitted successfully.' });
    } catch (err) {
        if (err.code === 11000)
            return res.status(409).json({ message: 'You have already reviewed this vendor.' });
        return res.status(500).json({ message: err.message });
    }
};

// ── Get vendor ratings ────────────────────────────────────────────────────────
// GET /api/vendors/:id/ratings
const getVendorRatings = async (req, res) => {
    try {
        const ratings = await Rating.find({ vendorId: req.params.id })
            .populate('clientId', 'name')
            .sort('-createdAt');

        const avg = ratings.length
            ? ratings.reduce((a, r) => a + r.rating, 0) / ratings.length
            : 0;

        return res.json({
            ratings: ratings.map(r => ({
                author:        r.clientId?.name || 'Anonymous',
                rating:        r.rating,
                quality:       r.quality,
                delivery:      r.delivery,
                price:         r.price,
                communication: r.communication,
                review:        r.review,
                date:          r.createdAt.toISOString().split('T')[0],
            })),
            avgRating:    parseFloat(avg.toFixed(1)),
            totalReviews: ratings.length,
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = { rateVendor, getVendorRatings };
