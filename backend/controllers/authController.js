const jwt           = require('jsonwebtoken');
const User          = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const { sendWelcomeEmail } = require('../services/emailService');

// ── Helpers ───────────────────────────────────────────────────────────────────

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const formatUser = (user) => ({
    _id:      user._id,
    name:     user.name,
    email:    user.email,
    userRole: user.userRole,
    role:     user.userRole === 'vendor' ? 'Vendor Partner' : 'Procurement Manager',
    avatar:   user.name.charAt(0).toUpperCase(),
    createdAt: user.createdAt,
});

// ── Register ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, userRole }
const register = async (req, res) => {
    try {
        const { name, email, password, userRole = 'client' } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Name, email, and password are required.' });

        if (password.length < 6)
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });

        if (!['client', 'vendor', 'admin'].includes(userRole))
            return res.status(400).json({ message: 'Invalid role. Must be client or vendor.' });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(409).json({ message: 'An account with this email already exists.' });

        const user = await User.create({ name, email, password, userRole });

        // Auto-create vendor profile for vendor accounts
        if (userRole === 'vendor') {
            await VendorProfile.create({
                userId:      user._id,
                companyName: name,
                categories:  [],
            });
        }

        const token = signToken(user._id);

        // Send welcome email (non-blocking)
        sendWelcomeEmail({ name: user.name, email: user.email, userRole: user.userRole })
            .catch(err => console.error('sendWelcomeEmail error:', err.message));

        return res.status(201).json({ token, user: formatUser(user) });

    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};

// ── Login ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required.' });

        const user = await User.findOne({ email }).select('+password');
        if (!user)
            return res.status(401).json({ message: 'Invalid email or password.' });

        const match = await user.matchPassword(password);
        if (!match)
            return res.status(401).json({ message: 'Invalid email or password.' });

        const token = signToken(user._id);
        return res.json({ token, user: formatUser(user) });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error during login.' });
    }
};

// ── Get current user ──────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
    return res.json({ user: formatUser(req.user) });
};

module.exports = { register, login, getMe };
