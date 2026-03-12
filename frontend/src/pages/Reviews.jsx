import { useState } from 'react';
import {
    Star, MessageSquare, X, CheckCircle, TrendingUp,
    Package, Truck, DollarSign, HeadphonesIcon,
} from 'lucide-react';

const VENDOR_LIST = [
    {
        id: 'v1', name: 'AlphaTech Supplies', category: 'Raw Materials',
        existingRating: 4.8, totalReviews: 142,
        scores: { quality: 4.9, delivery: 4.7, price: 4.5, communication: 4.8 },
        lastOrder: 'RFQ-1043 — Steel Coils',
        reviews: [
            { author: 'Procurement Team', text: 'Excellent quality steel coils. Delivered on time, no defects. Will order again.', date: '2026-03-01', rating: 5 },
            { author: 'Operations Dept', text: 'Good pricing for bulk orders. Responsive team.', date: '2026-02-12', rating: 4 },
        ],
    },
    {
        id: 'v2', name: 'MetroLogix Corp', category: 'Logistics',
        existingRating: 4.6, totalReviews: 178,
        scores: { quality: 4.5, delivery: 4.8, price: 4.4, communication: 4.6 },
        lastOrder: 'RFQ-1039 — Pan India Freight',
        reviews: [
            { author: 'Logistics Head', text: 'Very reliable. All deliveries on schedule. Great tracking system.', date: '2026-03-05', rating: 5 },
        ],
    },
    {
        id: 'v3', name: 'FastTrack Systems', category: 'IT & Software',
        existingRating: 4.5, totalReviews: 213,
        scores: { quality: 4.6, delivery: 4.5, price: 4.3, communication: 4.7 },
        lastOrder: 'RFQ-1041 — ERP Software',
        reviews: [
            { author: 'IT Manager', text: 'Implementation was smooth. Support team is very knowledgeable.', date: '2026-02-28', rating: 4 },
        ],
    },
    {
        id: 'v4', name: 'GreenPack Solutions', category: 'Packaging',
        existingRating: 3.6, totalReviews: 45,
        scores: { quality: 3.5, delivery: 3.4, price: 4.2, communication: 3.5 },
        lastOrder: 'RFQ-1038 — Corrugated Boxes',
        reviews: [
            { author: 'Warehouse Team', text: 'Affordable but delivery was delayed by 2 days. Quality acceptable.', date: '2026-02-20', rating: 3 },
        ],
    },
];

const RATING_CATEGORIES = [
    { key: 'quality',       label: 'Product Quality',      icon: Package    },
    { key: 'delivery',      label: 'Delivery Reliability', icon: Truck      },
    { key: 'price',         label: 'Price Competitiveness',icon: DollarSign },
    { key: 'communication', label: 'Communication',        icon: HeadphonesIcon },
];

function StarInput({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
                <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(i)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <Star
                        size={22}
                        className={(hover || value) >= i ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
                    />
                </button>
            ))}
            <span className="ml-1 text-sm font-semibold text-gray-600">{value > 0 ? ['','Poor','Fair','Good','Very Good','Excellent'][value] : ''}</span>
        </div>
    );
}

function StarDisplay({ value, size = 13 }) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={size} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
        </span>
    );
}

function RatingBar({ value, max = 5 }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-6 text-right">{value}</span>
        </div>
    );
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ vendor, onClose, onSubmit }) {
    const [ratings, setRatings] = useState({ quality: 0, delivery: 0, price: 0, communication: 0 });
    const [review,  setReview]  = useState('');
    const [error,   setError]   = useState('');
    const [done,    setDone]    = useState(false);

    const avg = Object.values(ratings).reduce((a, b) => a + b, 0) / 4;

    const handleSubmit = e => {
        e.preventDefault();
        if (Object.values(ratings).some(v => v === 0)) {
            setError('Please rate all categories.');
            return;
        }
        setDone(true);
        setTimeout(() => { onSubmit(vendor.id, ratings, review); onClose(); }, 1800);
    };

    if (done) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={28} className="text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1">Review Submitted!</h3>
                    <p className="text-sm text-gray-500">Your feedback for <strong>{vendor.name}</strong> has been recorded. Thank you!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Star size={15} className="text-amber-600 fill-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Rate Vendor</h2>
                            <p className="text-xs text-gray-400">{vendor.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    {/* Overall preview */}
                    {avg > 0 && (
                        <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3">
                            <p className="text-2xl font-extrabold text-indigo-700">{avg.toFixed(1)}</p>
                            <div>
                                <StarDisplay value={avg} size={16} />
                                <p className="text-xs text-indigo-500 mt-0.5">Overall rating</p>
                            </div>
                        </div>
                    )}

                    {/* Category ratings */}
                    <div className="space-y-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rate each category</p>
                        {RATING_CATEGORIES.map(cat => (
                            <div key={cat.key} className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                    <cat.icon size={14} className="text-gray-500" />
                                </div>
                                <div className="w-36 shrink-0">
                                    <p className="text-sm font-medium text-gray-700">{cat.label}</p>
                                </div>
                                <StarInput
                                    value={ratings[cat.key]}
                                    onChange={v => setRatings(prev => ({ ...prev, [cat.key]: v }))}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Written review */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Review (optional)</label>
                        <textarea
                            rows={3}
                            value={review}
                            onChange={e => setReview(e.target.value)}
                            placeholder="Share your experience working with this vendor..."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                            <Star size={14} /> Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Reviews() {
    const [vendors,      setVendors]      = useState(VENDOR_LIST);
    const [reviewVendor, setReviewVendor] = useState(null);
    const [expandedId,   setExpandedId]   = useState(null);

    const handleSubmitReview = (vendorId, ratings, text) => {
        const avg = (Object.values(ratings).reduce((a, b) => a + b, 0) / 4);
        setVendors(prev => prev.map(v => {
            if (v.id !== vendorId) return v;
            const newTotal = v.totalReviews + 1;
            const newRating = parseFloat(((v.existingRating * v.totalReviews + avg) / newTotal).toFixed(1));
            const newScores = { quality: parseFloat(((v.scores.quality * v.totalReviews + ratings.quality) / newTotal).toFixed(1)), delivery: parseFloat(((v.scores.delivery * v.totalReviews + ratings.delivery) / newTotal).toFixed(1)), price: parseFloat(((v.scores.price * v.totalReviews + ratings.price) / newTotal).toFixed(1)), communication: parseFloat(((v.scores.communication * v.totalReviews + ratings.communication) / newTotal).toFixed(1)) };
            const newReview = text ? [{ author: 'You', text, date: new Date().toISOString().split('T')[0], rating: Math.round(avg) }, ...v.reviews] : v.reviews;
            return { ...v, existingRating: newRating, totalReviews: newTotal, scores: newScores, reviews: newReview };
        }));
    };

    const overallAvg = (vendors.reduce((a, v) => a + v.existingRating, 0) / vendors.length).toFixed(1);

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Star className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Ratings & Reviews</h1>
                        <p className="text-sm text-gray-400">Rate vendors and view feedback</p>
                    </div>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Vendors Rated',   value: vendors.length,                                             icon: Star,      border: 'border-indigo-500' },
                    { label: 'Overall Avg.',     value: overallAvg,                                                icon: TrendingUp,border: 'border-amber-500'  },
                    { label: 'Total Reviews',    value: vendors.reduce((a, v) => a + v.totalReviews, 0),           icon: MessageSquare, border: 'border-emerald-500' },
                    { label: 'Top Rated',        value: vendors.sort((a,b) => b.existingRating - a.existingRating)[0].name.split(' ')[0], icon: Star, border: 'border-violet-500' },
                ].map(s => (
                    <div key={s.label} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.border} flex items-center gap-3`}>
                        <s.icon size={22} className="text-gray-200 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xl font-extrabold text-gray-800 truncate">{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vendor review cards */}
            <div className="space-y-4">
                {vendors.map(vendor => (
                    <div key={vendor.id} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

                        {/* Vendor row */}
                        <div className="flex items-center gap-4 px-5 py-4">
                            <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-extrabold text-base shrink-0">
                                {vendor.name.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="text-sm font-bold text-gray-800">{vendor.name}</h3>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{vendor.category}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">Last: {vendor.lastOrder}</p>
                            </div>

                            {/* Overall rating */}
                            <div className="text-center shrink-0">
                                <p className="text-2xl font-extrabold text-gray-800">{vendor.existingRating}</p>
                                <StarDisplay value={vendor.existingRating} size={11} />
                                <p className="text-[10px] text-gray-400 mt-0.5">{vendor.totalReviews} reviews</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setExpandedId(expandedId === vendor.id ? null : vendor.id)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                                >
                                    {expandedId === vendor.id ? 'Hide' : 'Details'}
                                </button>
                                <button
                                    onClick={() => setReviewVendor(vendor)}
                                    className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5"
                                >
                                    <Star size={12} /> Rate Now
                                </button>
                            </div>
                        </div>

                        {/* Category score bars */}
                        {expandedId === vendor.id && (
                            <div className="border-t border-gray-50 px-5 py-4 grid sm:grid-cols-2 gap-6">
                                {/* Score breakdown */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Score Breakdown</p>
                                    <div className="space-y-2.5">
                                        {RATING_CATEGORIES.map(cat => (
                                            <div key={cat.key} className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <cat.icon size={12} className="text-gray-500" />
                                                </div>
                                                <span className="text-xs text-gray-600 w-36 shrink-0">{cat.label}</span>
                                                <RatingBar value={vendor.scores[cat.key]} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent reviews */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Reviews</p>
                                    <div className="space-y-3">
                                        {vendor.reviews.slice(0, 2).map((r, i) => (
                                            <div key={i} className="bg-gray-50 rounded-xl p-3">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-xs font-semibold text-gray-700">{r.author}</span>
                                                    <div className="flex items-center gap-2">
                                                        <StarDisplay value={r.rating} size={10} />
                                                        <span className="text-[10px] text-gray-400">{r.date}</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">{r.text}</p>
                                            </div>
                                        ))}
                                        {vendor.reviews.length === 0 && (
                                            <p className="text-xs text-gray-400 italic">No reviews yet. Be the first!</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Rating modal */}
            {reviewVendor && (
                <ReviewModal
                    vendor={reviewVendor}
                    onClose={() => setReviewVendor(null)}
                    onSubmit={handleSubmitReview}
                />
            )}
        </div>
    );
}
