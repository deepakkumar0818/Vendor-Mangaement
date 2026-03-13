const router = require('express').Router();
const { protect }    = require('../middleware/auth');
const { clientOnly } = require('../middleware/role');
const { getDashboard } = require('../controllers/clientController');

router.get('/dashboard', protect, clientOnly, getDashboard);

module.exports = router;
