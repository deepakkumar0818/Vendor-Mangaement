import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, Star, MapPin, Clock, Send, Building2, Package,
    BadgeCheck, Filter, Phone, Mail, X, Loader2, RefreshCw,
    AlertCircle, ChevronLeft, ChevronRight, Tag, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';
const PAGE_SIZE = 6;

const ALL_CATEGORIES = [
    'All Categories',
    'Electronics & Electrical',
    'IT Equipment & Computers',
    'Office Supplies & Stationery',
    'Furniture & Fixtures',
    'HVAC & Cooling Systems',
    'Industrial Machinery & Equipment',
    'Safety & Security',
    'Packaging & Storage',
    'Raw Materials & Metals',
    'Printing & Marketing',
    'Facility Management & Cleaning',
    'Vehicles & Transport',
    'Medical & Healthcare',
    'Construction & Civil',
    'Food & Beverages',
    'Textiles & Uniforms',
    'Plumbing & Sanitary',
    'Power & Energy Solutions',
];

const SORT_OPTIONS = [
    { value: 'rating',   label: 'Highest Rating'  },
    { value: 'response', label: 'Fastest Response' },
    { value: 'delivery', label: 'Best Delivery'    },
    { value: 'price',    label: 'Best Price Score' },
];

function StarRating({ value, size = 14 }) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={size} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
        </span>
    );
}

function MiniBar({ value }) {
    return (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Math.min(value || 0, 100)}%` }} />
        </div>
    );
}

// ── Vendor Profile Modal ──────────────────────────────────────────────────────
function VendorProfileModal({ vendor, onClose, onRFQ }) {
    const metrics = [
        { label: 'Delivery Reliability', value: `${vendor.deliveryReliability || 0}%`, pct: vendor.deliveryReliability || 0 },
        { label: 'Order Success Rate',   value: `${vendor.orderSuccess || 0}%`,         pct: vendor.orderSuccess || 0 },
        { label: 'Client Satisfaction',  value: `${vendor.satisfaction || 0}%`,         pct: vendor.satisfaction || 0 },
        { label: 'Price Competitiveness',value: `${vendor.priceScore || 0}/100`,        pct: vendor.priceScore || 0 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-extrabold text-lg">
                            {vendor.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-bold text-gray-800">{vendor.name}</h2>
                                {vendor.badge && (
                                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <BadgeCheck size={11} /> {vendor.badge}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">
                                {(vendor.categories || []).slice(0, 2).join(', ') || 'General'} · {vendor.location || 'India'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <StarRating value={vendor.rating} size={16} />
                            <span className="text-sm font-bold text-gray-700">{vendor.rating || 0}</span>
                            <span className="text-xs text-gray-400">({vendor.reviews || 0} reviews)</span>
                        </div>
                        {vendor.email && <span className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={13} /> {vendor.email}</span>}
                        {vendor.phone && <span className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={13} /> {vendor.phone}</span>}
                    </div>

                    {vendor.description && <p className="text-sm text-gray-600 leading-relaxed">{vendor.description}</p>}

                    {vendor.products?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Products / Services</h3>
                            <div className="flex flex-wrap gap-2">
                                {vendor.products.map((p, i) => (
                                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{p}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {vendor.categories?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Supply Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {vendor.categories.map((c, i) => (
                                    <span key={i} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Tag size={10} /> {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {metrics.map(m => (
                                <div key={m.label} className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">{m.label}</span>
                                        <span className="text-sm font-bold text-gray-800">{m.value}</span>
                                    </div>
                                    <MiniBar value={m.pct} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Close</button>
                    <button onClick={() => { onClose(); onRFQ(vendor); }}
                        className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                        <Send size={15} /> Send RFQ
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Send RFQ Modal ────────────────────────────────────────────────────────────
function RFQModal({ vendor, onClose, authFetch }) {
    const [form, setForm] = useState({
        productName:      '',
        category:         vendor?.categories?.[0] || vendor?.category || '',
        quantity:         '',
        deliveryLocation: '',
        deadline:         '',
        description:      '',
    });
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState('');
    const [submitted, setSubmitted] = useState(null);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authFetch(`${API}/rfq`, {
                method: 'POST',
                body:   JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create RFQ.');
            setSubmitted(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={28} className="text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">RFQ Created Successfully!</h3>
                    <p className="text-sm text-gray-500 mb-1">
                        <strong>{submitted.rfq?.rfqNumber}</strong> has been submitted.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        <strong>{submitted.notifiedVendors}</strong> vendor(s) in "{form.category}" notified by email.
                    </p>
                    <button onClick={onClose} className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">Done</button>
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
                            <p className="text-xs text-gray-400">All vendors in the selected category will be notified</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FField label="Product / Service" required value={form.productName} onChange={v => upd('productName', v)} placeholder="e.g. Steel Coils" />
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Category *</label>
                            <select required value={form.category} onChange={e => upd('category', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700">
                                <option value="">Select category</option>
                                {ALL_CATEGORIES.filter(c => c !== 'All Categories').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FField label="Quantity" required value={form.quantity} onChange={v => upd('quantity', v)} placeholder="e.g. 500 units" />
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</label>
                            <input type="date" value={form.deadline} onChange={e => upd('deadline', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700" />
                        </div>
                    </div>
                    <FField label="Delivery Location" required value={form.deliveryLocation} onChange={v => upd('deliveryLocation', v)} placeholder="e.g. Mumbai Warehouse, Maharashtra" />
                    <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Additional Requirements</label>
                        <textarea rows={3} value={form.description} onChange={e => upd('description', e.target.value)}
                            placeholder="Specify quality requirements, certifications, brand preference, etc."
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300 resize-none" />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                            <p className="text-xs text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send RFQ</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FField({ label, value, onChange, placeholder, required }) {
    return (
        <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}{required && ' *'}</label>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300" />
        </div>
    );
}

// ── Vendor Card ───────────────────────────────────────────────────────────────
function VendorCard({ vendor, onViewProfile, onSendRFQ }) {
    const displayCat = (vendor.categories || [])[0] || 'General';
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
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
                    <span className="text-xs text-gray-400 truncate block">{displayCat}</span>
                </div>
            </div>

            {(vendor.products?.length > 0) ? (
                <div className="flex flex-wrap gap-1.5">
                    {vendor.products.slice(0, 2).map((p, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{p}</span>
                    ))}
                    {vendor.products.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md">+{vendor.products.length - 2}</span>
                    )}
                </div>
            ) : vendor.categories?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {vendor.categories.slice(0, 2).map((c, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                            <Tag size={9} /> {c}
                        </span>
                    ))}
                </div>
            ) : null}

            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-2">
                    <p className="text-xs font-bold text-gray-700">{vendor.rating ? vendor.rating.toFixed(1) : '—'}</p>
                    <p className="text-[10px] text-gray-400">Rating</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                    <p className="text-xs font-bold text-gray-700">{vendor.responseTime && vendor.responseTime !== '—' ? vendor.responseTime : '—'}</p>
                    <p className="text-[10px] text-gray-400">Response</p>
                </div>
                <div className="bg-gray-50 rounded-lg py-2">
                    <p className="text-xs font-bold text-gray-700">{vendor.deliveryReliability ? `${vendor.deliveryReliability}%` : '—'}</p>
                    <p className="text-[10px] text-gray-400">On-Time</p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <StarRating value={vendor.rating || 0} size={12} />
                    <span className="text-xs text-gray-400">({vendor.reviews || 0})</span>
                </div>
                {vendor.location && (
                    <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} /> {vendor.location}</span>
                )}
            </div>

            <div className="flex gap-2 mt-auto pt-1 border-t border-gray-50">
                <button onClick={() => onViewProfile(vendor)}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition">
                    View Profile
                </button>
                <button onClick={() => onSendRFQ(vendor)}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">
                    <Send size={12} /> Send RFQ
                </button>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorMarketplace() {
    const { authFetch } = useAuth();

    const [vendors,       setVendors]       = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState('');
    const [search,        setSearch]        = useState('');
    const [category,      setCategory]      = useState('All Categories');
    const [minRating,     setMinRating]     = useState('');
    const [sortBy,        setSortBy]        = useState('rating');
    const [page,          setPage]          = useState(1);
    const [profileVendor, setProfileVendor] = useState(null);
    const [rfqVendor,     setRfqVendor]     = useState(null);
    const [showFilters,   setShowFilters]   = useState(false);

    const debounceRef = useRef(null);

    const loadVendors = useCallback(async (q, cat, minR, sort) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (q && q.trim())                   params.set('search',    q.trim());
            if (cat && cat !== 'All Categories') params.set('category',  cat);
            if (minR)                            params.set('minRating', minR);
            if (sort)                            params.set('sort',      sort);

            const res  = await fetch(`${API}/vendors?${params}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load vendors.');
            setVendors(data.vendors || []);
            setPage(1);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load + auto-refresh every 30s for real-time updates
    useEffect(() => {
        loadVendors(search, category, minRating, sortBy);
        const interval = setInterval(() => loadVendors(search, category, minRating, sortBy), 30000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, minRating, sortBy]);

    const handleSearch = (v) => {
        setSearch(v);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => loadVendors(v, category, minRating, sortBy), 400);
    };

    const totalPages = Math.ceil(vendors.length / PAGE_SIZE);
    const paginated  = vendors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Vendor Marketplace</h1>
                        <p className="text-sm text-gray-400">Discover and connect with registered suppliers — live data</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => loadVendors(search, category, minRating, sortBy)} disabled={loading}
                        className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button onClick={() => setRfqVendor({})}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                        <Send size={15} /> Broadcast RFQ
                    </button>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Vendors',  value: vendors.length, icon: Building2, color: 'border-indigo-500' },
                    { label: 'Avg. Rating',    value: vendors.length ? (vendors.reduce((a,v) => a+(v.rating||0), 0)/vendors.length).toFixed(1) : '—', icon: Star, color: 'border-amber-500' },
                    { label: 'Categories',     value: new Set(vendors.flatMap(v => v.categories || [])).size, icon: Package, color: 'border-emerald-500' },
                    { label: 'Showing',        value: paginated.length, icon: Filter, color: 'border-violet-500' },
                ].map(s => (
                    <div key={s.label} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.color} flex items-center gap-3`}>
                        <s.icon size={22} className="text-gray-200 shrink-0" />
                        <div>
                            <p className="text-xl font-extrabold text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={search} onChange={e => handleSearch(e.target.value)}
                            placeholder="Search by vendor name, product, or category…"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                        <Filter size={14} /> Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700">
                                {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Min. Rating</label>
                            <select value={minRating} onChange={e => setMinRating(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700">
                                <option value="">All Ratings</option>
                                <option value="4.5">4.5+</option>
                                <option value="4">4.0+</option>
                                <option value="3.5">3.5+</option>
                                <option value="3">3.0+</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Sort By</label>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700">
                                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle size={15} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-indigo-400" size={36} />
                </div>
            ) : vendors.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Building2 size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-lg">No vendors found</p>
                    <p className="text-sm mt-1">
                        {search || category !== 'All Categories'
                            ? 'Try adjusting your search or filters.'
                            : 'No vendors have registered yet. Vendors must register and set up their profile to appear here.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                        {paginated.map(vendor => (
                            <VendorCard key={vendor._id} vendor={vendor} onViewProfile={setProfileVendor} onSendRFQ={setRfqVendor} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm text-gray-600 px-3">Page {page} of {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {profileVendor && (
                <VendorProfileModal vendor={profileVendor} onClose={() => setProfileVendor(null)} onRFQ={setRfqVendor} />
            )}
            {rfqVendor !== null && (
                <RFQModal vendor={rfqVendor} authFetch={authFetch} onClose={() => setRfqVendor(null)} />
            )}
        </div>
    );
}
