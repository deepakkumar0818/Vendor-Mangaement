const router = require('express').Router();
const { protect }                    = require('../middleware/auth');
const { getVendors, getVendorById }  = require('../controllers/clientController');
const { rateVendor, getVendorRatings } = require('../controllers/ratingController');

// Public routes (vendor marketplace)
router.get('/',    getVendors);
router.get('/:id', getVendorById);

// Protected rating routes
router.post('/:id/ratings', protect, rateVendor);
router.get( '/:id/ratings', getVendorRatings);

module.exports = router;
