import { useState, useMemo } from 'react';
import {
    Search, SlidersHorizontal, Star, MapPin, Clock, Truck,
    ChevronLeft, ChevronRight, X, Send, Building2, Package,
    Award, TrendingUp, MessageSquare, BadgeCheck, Filter,
    BarChart3, ShieldCheck, Phone, Mail,
} from 'lucide-react';

const VENDOR_DATA = [
    {
        id: 1, name: 'AlphaTech Supplies', category: 'Raw Materials',
        products: ['Steel Coils', 'Aluminum Sheets', 'Iron Bars'],
        rating: 4.8, reviews: 142, location: 'Mumbai',
        responseTime: '2 hrs', deliveryReliability: 96, priceScore: 88,
        orderSuccess: 97, satisfaction: 94, badge: 'Top Rated',
        contact: 'contact@alphatech.com', phone: '+91 98765 43210',
        description: 'ISO 9001 certified raw material supplier with 15+ years of experience. Specializes in ferrous and non-ferrous metals for manufacturing industries.',
        deliveryTrend: [92, 94, 93, 96, 95, 96],
    },
    {
        id: 2, name: 'BlueOcean Trading', category: 'Logistics',
        products: ['Freight Services', 'Warehousing', 'Last Mile Delivery'],
        rating: 4.2, reviews: 87, location: 'Delhi',
        responseTime: '4 hrs', deliveryReliability: 89, priceScore: 72,
        orderSuccess: 88, satisfaction: 82, badge: null,
        contact: 'info@blueocean.com', phone: '+91 87654 32109',
        description: 'Pan India logistics partner offering end-to-end freight, warehousing, and last-mile delivery solutions for B2B businesses.',
        deliveryTrend: [85, 87, 86, 89, 88, 89],
    },
    {
        id: 3, name: 'FastTrack Systems', category: 'IT & Software',
        products: ['ERP Software', 'IT Hardware', 'Cloud Services'],
        rating: 4.5, reviews: 213, location: 'Bangalore',
        responseTime: '1 hr', deliveryReliability: 94, priceScore: 85,
        orderSuccess: 93, satisfaction: 91, badge: 'Fast Responder',
        contact: 'support@fasttrack.in', phone: '+91 76543 21098',
        description: 'Leading IT solutions provider offering enterprise software, hardware procurement, and cloud infrastructure services across India.',
        deliveryTrend: [90, 91, 93, 92, 94, 94],
    },
    {
        id: 4, name: 'GreenPack Solutions', category: 'Packaging',
        products: ['Corrugated Boxes', 'Bubble Wrap', 'Stretch Film'],
        rating: 3.6, reviews: 45, location: 'Chennai',
        responseTime: '8 hrs', deliveryReliability: 78, priceScore: 91,
        orderSuccess: 79, satisfaction: 73, badge: null,
        contact: 'hello@greenpack.com', phone: '+91 65432 10987',
        description: 'Eco-friendly packaging manufacturer offering cost-effective solutions for e-commerce, retail, and industrial packaging needs.',
        deliveryTrend: [76, 75, 78, 77, 79, 78],
    },
    {
        id: 5, name: 'PrimeStar MRO', category: 'MRO Supplies',
        products: ['Safety Equipment', 'Cleaning Supplies', 'Industrial Tools'],
        rating: 4.1, reviews: 98, location: 'Pune',
        responseTime: '3 hrs', deliveryReliability: 88, priceScore: 79,
        orderSuccess: 86, satisfaction: 84, badge: null,
        contact: 'orders@primestar.co', phone: '+91 54321 09876',
        description: 'Comprehensive MRO supplier providing safety equipment, industrial tools, and facility maintenance supplies for factories and warehouses.',
        deliveryTrend: [84, 86, 85, 88, 87, 88],
    },
    {
        id: 6, name: 'MetroLogix Corp', category: 'Logistics',
        products: ['Pan India Freight', 'Cold Chain Logistics', 'Express Delivery'],
        rating: 4.6, reviews: 178, location: 'Hyderabad',
        responseTime: '2 hrs', deliveryReliability: 95, priceScore: 82,
        orderSuccess: 94, satisfaction: 92, badge: 'Preferred',
        contact: 'ops@metrologix.com', phone: '+91 43210 98765',
        description: 'Premium logistics provider with specialized cold chain and express delivery capabilities. Trusted by 500+ enterprises across India.',
        deliveryTrend: [91, 93, 92, 95, 94, 95],
    },
    {
        id: 7, name: 'CloudBase IT', category: 'IT & Software',
        products: ['Cloud Hosting', 'Cybersecurity Solutions', 'IT Support'],
        rating: 3.8, reviews: 63, location: 'Bangalore',
        responseTime: '6 hrs', deliveryReliability: 82, priceScore: 88,
        orderSuccess: 81, satisfaction: 78, badge: null,
        contact: 'hello@cloudbase.io', phone: '+91 32109 87654',
        description: 'Cloud-first IT services company offering hosting, managed security, and 24/7 IT support services for growing businesses.',
        deliveryTrend: [79, 80, 82, 81, 83, 82],
    },
    {
        id: 8, name: 'ProBuild Materials', category: 'Raw Materials',
        products: ['Cement', 'TMT Steel Rods', 'Sand & Aggregates'],
        rating: 4.3, reviews: 134, location: 'Mumbai',
        responseTime: '5 hrs', deliveryReliability: 91, priceScore: 86,
        orderSuccess: 90, satisfaction: 87, badge: null,
        contact: 'sales@probuild.in', phone: '+91 21098 76543',
        description: 'Bulk construction material supplier with pan India distribution. Specializes in cement, structural steel, and aggregate supply for large projects.',
        deliveryTrend: [87, 88, 90, 91, 90, 91],
    },
];

const CATEGORIES = ['All Categories', 'Raw Materials', 'Logistics', 'IT & Software', 'Packaging', 'MRO Supplies'];
const RATINGS    = ['All Ratings', '4.5+', '4.0+', '3.5+'];
const SORT_OPTIONS = [
    { value: 'rating',   label: 'Highest Rating'   },
    { value: 'response', label: 'Fastest Response'  },
    { value: 'delivery', label: 'Best Delivery'     },
    { value: 'price',    label: 'Best Price Score'  },
];

const PAGE_SIZE = 6;

function StarRating({ value, size = 14 }) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={size} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
        </span>
    );
}

function MiniBar({ value, max = 100, color = 'bg-indigo-500' }) {
    return (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
        </div>
    );
}

// ── Vendor Profile Modal ───────────────────────────────────────────────────────
function VendorProfileModal({ vendor, onClose, onRFQ }) {
    const metrics = [
        { label: 'Delivery Reliability', value: `${vendor.deliveryReliability}%`, pct: vendor.deliveryReliability, color: 'bg-indigo-500' },
        { label: 'Order Success Rate',   value: `${vendor.orderSuccess}%`,        pct: vendor.orderSuccess,        color: 'bg-indigo-500' },
        { label: 'Client Satisfaction',  value: `${vendor.satisfaction}%`,        pct: vendor.satisfaction,        color: 'bg-indigo-500' },
        { label: 'Price Competitiveness',value: `${vendor.priceScore}/100`,       pct: vendor.priceScore,          color: 'bg-indigo-500' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-extrabold text-lg">
                            {vendor.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-800">{vendor.name}</h2>
                                {vendor.badge && (
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <BadgeCheck size={11} /> {vendor.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">{vendor.category} · {vendor.location}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Rating + contact row */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <StarRating value={vendor.rating} size={16} />
                            <span className="text-sm font-bold text-gray-700">{vendor.rating}</span>
                            <span className="text-xs text-gray-400">({vendor.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock size={13} /> Avg. Response: {vendor.responseTime}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail size={13} /> {vendor.contact}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone size={13} /> {vendor.phone}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed">{vendor.description}</p>

                    {/* Products */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Products Supplied</h3>
                        <div className="flex flex-wrap gap-2">
                            {vendor.products.map(p => (
                                <span key={p} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{p}</span>
                            ))}
                        </div>
                    </div>

                    {/* Performance metrics */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {metrics.map(m => (
                                <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">{m.label}</span>
                                        <span className="text-sm font-bold text-gray-800">{m.value}</span>
                                    </div>
                                    <MiniBar value={m.pct} color={m.color} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery trend mini chart */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Delivery Reliability Trend (6 months)</h3>
                        <div className="flex items-end gap-1.5 h-16 bg-gray-50 rounded-xl px-4 py-3">
                            {vendor.deliveryTrend.map((v, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full bg-indigo-400 rounded-sm opacity-80"
                                        style={{ height: `${(v / 100) * 40}px` }}
                                    />
                                    <span className="text-[10px] text-gray-400">{['O','N','D','J','F','M'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                        Close
                    </button>
                    <button
                        onClick={() => { onClose(); onRFQ(vendor); }}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <Send size={15} /> Send RFQ
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Send RFQ Modal ──────────────────────────────────────────────────────────
function RFQModal({ vendor, onClose }) {
    const [form, setForm] = useState({ product: '', category: vendor?.category || '', quantity: '', location: '', deadline: '', notes: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(onClose, 2000);
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} className="text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">RFQ Sent Successfully!</h3>
                    <p className="text-sm text-gray-500">
                        {vendor ? `Your RFQ has been sent to ${vendor.name}.` : 'Your RFQ has been sent to all matching vendors.'} They will respond within {vendor?.responseTime || '4–8 hrs'}.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Send size={15} className="text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Create RFQ</h2>
                            {vendor && <p className="text-xs text-gray-400">To: {vendor.name}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Name *</label>
                            <input required value={form.product} onChange={e => setForm(p => ({ ...p, product: e.target.value }))}
                                placeholder="e.g. Steel Coils" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Category *</label>
                            <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700">
                                <option value="">Select category</option>
                                {CATEGORIES.filter(c => c !== 'All Categories').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Quantity *</label>
                            <input required value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                                placeholder="e.g. 500 units" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">Delivery Deadline</label>
                            <input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Delivery Location *</label>
                        <input required value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                            placeholder="e.g. Mumbai Warehouse, Maharashtra" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Additional Notes</label>
                        <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                            placeholder="Specify quality requirements, certifications needed, etc."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 resize-none" />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                            <Send size={14} /> Send RFQ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Vendor Card ─────────────────────────────────────────────────────────────
function VendorCard({ vendor, onViewProfile, onSendRFQ }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
            {/* Top: avatar + name + badge */}
            <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-extrabold text-base shrink-0">
                    {vendor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-800 truncate">{vendor.name}</h3>
                        {vendor.badge && (
                            <span className="shrink-0 text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <BadgeCheck size={10} /> {vendor.badge}
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400">{vendor.category}</span>
                </div>
            </div>

            {/* Products */}
            <div className="flex flex-wrap gap-1.5">
                {vendor.products.slice(0, 2).map(p => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{p}</span>
                ))}
                {vendor.products.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">+{vendor.products.length - 2}</span>
                )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-2">
                    <p className="text-xs font-bold text-gray-700">{vendor.rating}</p>
                    <p className="text-[10px] text-gray-400">Rating</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                    <p className="text-xs font-bold text-gray-700">{vendor.responseTime}</p>
                    <p className="text-[10px] text-gray-400">Response</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                    <p className="text-xs font-bold text-gray-700">{vendor.deliveryReliability}%</p>
                    <p className="text-[10px] text-gray-400">On-Time</p>
                </div>
            </div>

            {/* Rating stars + location */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <StarRating value={vendor.rating} size={12} />
                    <span className="text-xs text-gray-400">({vendor.reviews})</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} /> {vendor.location}
                </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-1 border-t border-gray-50">
                <button
                    onClick={() => onViewProfile(vendor)}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition"
                >
                    View Profile
                </button>
                <button
                    onClick={() => onSendRFQ(vendor)}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
                >
                    <Send size={12} /> Send RFQ
                </button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorMarketplace() {
    const [search,       setSearch]       = useState('');
    const [category,     setCategory]     = useState('All Categories');
    const [minRating,    setMinRating]    = useState('All Ratings');
    const [sortBy,       setSortBy]       = useState('rating');
    const [page,         setPage]         = useState(1);
    const [profileVendor,setProfileVendor]= useState(null);
    const [rfqVendor,    setRfqVendor]   = useState(null);
    const [showFilters,  setShowFilters]  = useState(false);

    const filtered = useMemo(() => {
        let list = [...VENDOR_DATA];
        const q = search.trim().toLowerCase();
        if (q) list = list.filter(v =>
            v.name.toLowerCase().includes(q) ||
            v.category.toLowerCase().includes(q) ||
            v.products.some(p => p.toLowerCase().includes(q)) ||
            v.location.toLowerCase().includes(q)
        );
        if (category !== 'All Categories') list = list.filter(v => v.category === category);
        if (minRating !== 'All Ratings') {
            const min = parseFloat(minRating);
            list = list.filter(v => v.rating >= min);
        }
        list.sort((a, b) => {
            if (sortBy === 'rating')   return b.rating - a.rating;
            if (sortBy === 'response') return parseInt(a.responseTime) - parseInt(b.responseTime);
            if (sortBy === 'delivery') return b.deliveryReliability - a.deliveryReliability;
            if (sortBy === 'price')    return b.priceScore - a.priceScore;
            return 0;
        });
        return list;
    }, [search, category, minRating, sortBy]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = v => { setSearch(v); setPage(1); };
    const handleCategory = v => { setCategory(v); setPage(1); };

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Vendor Marketplace</h1>
                        <p className="text-sm text-gray-400">Discover and connect with verified suppliers</p>
                    </div>
                </div>
                <button
                    onClick={() => setRfqVendor({})}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                >
                    <Send size={15} /> Broadcast RFQ
                </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Vendors',    value: VENDOR_DATA.length,                icon: Building2, color: 'border-indigo-500' },
                    { label: 'Avg. Rating',      value: (VENDOR_DATA.reduce((a,v)=>a+v.rating,0)/VENDOR_DATA.length).toFixed(1), icon: Star, color: 'border-amber-500' },
                    { label: 'Categories',       value: CATEGORIES.length - 1,              icon: Package,   color: 'border-emerald-500' },
                    { label: 'Avg. Response',    value: '3.1 hrs',                          icon: Clock,     color: 'border-violet-500'  },
                ].map(s => (
                    <div key={s.label} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.color} flex items-center gap-3`}>
                        <s.icon size={22} className="text-gray-300 shrink-0" />
                        <div>
                            <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Sort bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Search vendors, products, categories..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${showFilters ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                    <Filter size={15} /> Filters
                </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
                <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 flex flex-wrap gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(c => (
                                <button key={c} onClick={() => handleCategory(c)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${category === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="border-l border-gray-100 pl-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Min Rating</label>
                        <div className="flex flex-wrap gap-2">
                            {RATINGS.map(r => (
                                <button key={r} onClick={() => setMinRating(r)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${minRating === r ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-400 mb-4">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> vendor{filtered.length !== 1 ? 's' : ''}
                {search && <> matching "<span className="text-indigo-600">{search}</span>"</>}
            </p>

            {/* Vendor grid */}
            {paginated.length === 0 ? (
                <div className="py-20 text-center">
                    <Search size={40} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-gray-400 text-sm">No vendors found. Try a different search term.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {paginated.map(v => (
                        <VendorCard key={v.id} vendor={v}
                            onViewProfile={setProfileVendor}
                            onSendRFQ={setRfqVendor}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${page === p ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Modals */}
            {profileVendor && (
                <VendorProfileModal
                    vendor={profileVendor}
                    onClose={() => setProfileVendor(null)}
                    onRFQ={v => { setProfileVendor(null); setRfqVendor(v); }}
                />
            )}
            {rfqVendor !== null && (
                <RFQModal
                    vendor={rfqVendor?.id ? rfqVendor : null}
                    onClose={() => setRfqVendor(null)}
                />
            )}
        </div>
    );
}
