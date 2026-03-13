const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { clientOnly } = require('../middleware/role');
const {
    createRFQ, getClientRFQs, getRFQById, getResponses, getComparison,
} = require('../controllers/rfqController');

// All RFQ client routes require auth
router.use(protect);

router.post('/', clientOnly, createRFQ);
router.get('/', clientOnly, getClientRFQs);
router.get('/:id', clientOnly, getRFQById);
router.get('/:id/responses', clientOnly, getResponses);
router.get('/:id/comparison', clientOnly, getComparison);

module.exports = router;
