const router = require('express').Router();
const { protect }     = require('../middleware/auth');
const { vendorOnly }  = require('../middleware/role');
const ctrl            = require('../controllers/vendorController');

// All vendor routes require authentication + vendor role
router.use(protect, vendorOnly);

// Profile
router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);

// Products
router.post(  '/products',     ctrl.upload.single('image'), ctrl.addProduct);
router.get(   '/products',     ctrl.getProducts);
router.put(   '/products/:id', ctrl.upload.single('image'), ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Dashboard analytics
router.get('/dashboard', ctrl.getDashboard);

// RFQ inbox + respond
router.get( '/rfq',                  ctrl.getVendorRFQs);
router.post('/rfq/:rfqId/respond',   ctrl.respondToRFQ);

module.exports = router;
