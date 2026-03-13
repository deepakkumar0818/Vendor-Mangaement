import { useState, useEffect, useCallback } from 'react';
import {
    FileText, Plus, Search, X, Clock, CheckCircle, AlertCircle,
    Loader2, RefreshCw, Send, MapPin, Package, Tag, Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

const ALL_CATEGORIES = [
    'Electronics & Electrical', 'IT Equipment & Computers', 'Office Supplies & Stationery',
    'Furniture & Fixtures', 'HVAC & Cooling Systems', 'Industrial Machinery & Equipment',
    'Safety & Security', 'Packaging & Storage', 'Raw Materials & Metals',
    'Printing & Marketing', 'Facility Management & Cleaning', 'Vehicles & Transport',
    'Medical & Healthcare', 'Construction & Civil', 'Food & Beverages',
    'Textiles & Uniforms', 'Plumbing & Sanitary', 'Power & Energy Solutions',
];

function statusStyle(status) {
    if (!status) return { badge: 'bg-gray-100 text-gray-500', Icon: Clock };
    const s = status.toLowerCase();
    if (s.includes('response')) return { badge: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle };
    if (s === 'open' || s.includes('awaiting')) return { badge: 'bg-amber-100 text-amber-700', Icon: Clock };
    if (s === 'closed') return { badge: 'bg-gray-100 text-gray-500', Icon: X };
    if (s === 'awarded') return { badge: 'bg-indigo-100 text-indigo-700', Icon: CheckCircle };
    return { badge: 'bg-gray-100 text-gray-500', Icon: Clock };
}

export default function Quotes() {
    const { authFetch } = useAuth();

    const [rfqs,        setRfqs]        = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');
    const [search,      setSearch]      = useState('');
    const [filterStat,  setFilterStat]  = useState('All');
    const [showCreate,  setShowCreate]  = useState(false);

    const loadRFQs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res  = await authFetch(`${API}/rfq`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load RFQs.');
            setRfqs(data.rfqs || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => { loadRFQs(); }, [loadRFQs]);

    const filtered = rfqs.filter(q => {
        const matchSearch = !search ||
            q.rfqNumber?.toLowerCase().includes(search.toLowerCase()) ||
            q.productName?.toLowerCase().includes(search.toLowerCase()) ||
            q.category?.toLowerCase().includes(search.toLowerCase());

        const matchStatus = filterStat === 'All' ||
            (filterStat === 'Responses' && q.responseCount > 0) ||
            (filterStat === 'Awaiting'  && q.responseCount === 0 && q.status === 'open') ||
            (filterStat === 'Closed'    && q.status !== 'open');

        return matchSearch && matchStatus;
    });

    const counts = {
        total:     rfqs.length,
        responses: rfqs.filter(q => q.responseCount > 0).length,
        awaiting:  rfqs.filter(q => q.responseCount === 0 && q.status === 'open').length,
        closed:    rfqs.filter(q => q.status !== 'open').length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">RFQ Requests</h1>
                        <p className="text-sm text-gray-400">Send RFQs to vendors and track their responses</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadRFQs} disabled={loading}
                        className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <button onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
                        <Plus size={16} /> Create RFQ
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total RFQs',        value: counts.total,     border: 'border-indigo-500',  text: 'text-indigo-700'  },
                    { label: 'Responses Received', value: counts.responses, border: 'border-emerald-500', text: 'text-emerald-700' },
                    { label: 'Awaiting Response',  value: counts.awaiting,  border: 'border-amber-500',   text: 'text-amber-700'   },
                    { label: 'Closed',             value: counts.closed,    border: 'border-gray-400',    text: 'text-gray-600'    },
                ].map(c => (
                    <div key={c.label} className={`bg-white rounded-xl border-l-4 ${c.border} p-4 shadow-sm`}>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{c.label}</p>
                        <p className={`text-3xl font-extrabold ${c.text}`}>{loading ? '—' : c.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search by RFQ #, product or category…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                </div>
                <select value={filterStat} onChange={e => setFilterStat(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700">
                    {['All', 'Responses', 'Awaiting', 'Closed'].map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle size={15} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-3">
                        {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <FileText size={48} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No RFQs found</p>
                        <p className="text-sm text-gray-300 mt-1">
                            {rfqs.length === 0 ? 'Create your first RFQ to get started.' : 'Try adjusting your filters.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {['RFQ #', 'Product', 'Category', 'Qty', 'Delivery To', 'Responses', 'Status', 'Date'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(q => {
                                    const st = statusStyle(q.status === 'open' && q.responseCount > 0 ? 'Responses Received' : q.status);
                                    const displayStatus = q.responseCount > 0 ? `${q.responseCount} Response${q.responseCount !== 1 ? 's' : ''}` : q.status === 'open' ? 'Awaiting' : q.status;
                                    return (
                                        <tr key={q._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-indigo-600">{q.rfqNumber}</td>
                                            <td className="px-5 py-3.5 text-gray-800 font-medium">{q.productName}</td>
                                            <td className="px-5 py-3.5 text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Tag size={11} /> {q.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <Package size={11} /> {q.quantity}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={11} /> {q.deliveryLocation}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-center">
                                                <span className={`text-sm font-bold ${q.responseCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    {q.responseCount}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.badge}`}>
                                                    <st.Icon size={11} /> {displayStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-400 text-xs">
                                                {new Date(q.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {!loading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {rfqs.length} RFQs
                    </div>
                )}
            </div>

            {/* Create RFQ Modal */}
            {showCreate && (
                <CreateRFQModal
                    authFetch={authFetch}
                    onClose={() => setShowCreate(false)}
                    onSuccess={() => { setShowCreate(false); loadRFQs(); }}
                />
            )}
        </div>
    );
}

/* ─── Create RFQ Modal ───────────────────────────────────────────────────────── */
function CreateRFQModal({ authFetch, onClose, onSuccess }) {
    const [form, setForm] = useState({
        productName:      '',
        category:         '',
        quantity:         '',
        deliveryLocation: '',
        deadline:         '',
        description:      '',
    });
    const [saving,    setSaving]    = useState(false);
    const [error,     setError]     = useState('');
    const [submitted, setSubmitted] = useState(null);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const res  = await authFetch(`${API}/rfq`, { method: 'POST', body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create RFQ.');
            setSubmitted(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={28} className="text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">RFQ Created!</h3>
                    <p className="text-sm text-gray-500 mb-1">
                        <strong>{submitted.rfq?.rfqNumber}</strong> has been submitted.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        <strong>{submitted.notifiedVendors}</strong> vendor(s) in "<em>{form.category}</em>" notified by email.
                    </p>
                    <button onClick={onSuccess}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                        Done
                    </button>
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
                                {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FField label="Quantity" required value={form.quantity} onChange={v => upd('quantity', v)} placeholder="e.g. 500 units" />
                        <div className="space-y-1">
                            <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide items-center gap-1">
                                <Calendar size={11} /> Deadline
                            </label>
                            <input type="date" value={form.deadline} onChange={e => upd('deadline', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700" />
                        </div>
                    </div>
                    <FField label="Delivery Location" required value={form.deliveryLocation} onChange={v => upd('deliveryLocation', v)} placeholder="e.g. Mumbai Warehouse, Maharashtra" icon={<MapPin size={11} />} />
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
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                            {saving ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send RFQ</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FField({ label, value, onChange, placeholder, required, icon }) {
    return (
        <div className="space-y-1">
            <label className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide items-center gap-1">
                {icon} {label}{required && ' *'}
            </label>
            <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300" />
        </div>
    );
}
