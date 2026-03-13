import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Inbox, Star, TrendingDown, Truck, Clock,
    ChevronUp, ChevronDown, Trophy, BadgeCheck, Loader2,
    DollarSign, Zap, ArrowUpDown, AlertCircle, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

function BestBadge({ label }) {
    return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            <Trophy size={9} /> {label}
        </span>
    );
}

function SortIcon({ field, sortBy, dir }) {
    if (sortBy !== field) return <ArrowUpDown size={13} className="text-gray-300" />;
    return dir === 'asc' ? <ChevronUp size={13} className="text-indigo-500" /> : <ChevronDown size={13} className="text-indigo-500" />;
}

export default function VendorResponses() {
    const { authFetch } = useAuth();

    const [rfqs,       setRfqs]       = useState([]);
    const [activeRFQ,  setActiveRFQ]  = useState(null);
    const [comparison, setComparison] = useState(null);
    const [loadingRFQ, setLoadingRFQ] = useState(true);
    const [loadingCmp, setLoadingCmp] = useState(false);
    const [error,      setError]      = useState('');
    const [sortBy,     setSortBy]     = useState('price');
    const [sortDir,    setSortDir]    = useState('asc');

    // Load all client RFQs
    const loadRFQs = useCallback(async () => {
        setLoadingRFQ(true);
        setError('');
        try {
            const res  = await authFetch(`${API}/rfq`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load RFQs.');
            const list = data.rfqs || [];
            setRfqs(list);
            // Auto-select first RFQ that has responses, else first RFQ
            const withResp = list.find(r => r.responseCount > 0);
            if (withResp) setActiveRFQ(withResp._id);
            else if (list.length) setActiveRFQ(list[0]._id);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingRFQ(false);
        }
    }, [authFetch]);

    useEffect(() => { loadRFQs(); }, [loadRFQs]);

    // Load comparison whenever activeRFQ changes
    useEffect(() => {
        if (!activeRFQ) { setComparison(null); return; }
        setLoadingCmp(true);
        authFetch(`${API}/rfq/${activeRFQ}/comparison`)
            .then(r => r.json())
            .then(data => setComparison(data))
            .catch(() => setComparison(null))
            .finally(() => setLoadingCmp(false));
    }, [activeRFQ, authFetch]);

    const responses   = comparison?.comparison || [];
    const bests       = comparison?.bests || {};
    const recommended = comparison?.recommended || null;

    const sorted = useMemo(() => {
        if (!responses.length) return [];
        return [...responses].sort((a, b) => {
            let va, vb;
            if      (sortBy === 'price')    { va = a.effectivePrice;             vb = b.effectivePrice; }
            else if (sortBy === 'delivery') { va = parseInt(a.deliveryTime) || 99; vb = parseInt(b.deliveryTime) || 99; }
            else if (sortBy === 'rating')   { va = a.rating || 0;                vb = b.rating || 0; }
            else if (sortBy === 'freight')  { va = a.deliveryCharges || 0;       vb = b.deliveryCharges || 0; }
            else return 0;
            return sortDir === 'asc' ? va - vb : vb - va;
        });
    }, [responses, sortBy, sortDir]);

    const handleSort = field => {
        if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    const rfqCounts = {
        total:    rfqs.length,
        withResp: rfqs.filter(r => r.responseCount > 0).length,
        awaiting: rfqs.filter(r => r.responseCount === 0 && r.status === 'open').length,
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Inbox className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Vendor Responses</h1>
                        <p className="text-sm text-gray-400">Track and compare quotations from vendors — live data</p>
                    </div>
                </div>
                <button onClick={loadRFQs} disabled={loadingRFQ}
                    className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
                    <RefreshCw size={14} className={loadingRFQ ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* KPI strip */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'RFQs Sent',          value: rfqCounts.total,    icon: Inbox,     border: 'border-indigo-500'  },
                    { label: 'Responses Received',  value: rfqCounts.withResp, icon: BadgeCheck, border: 'border-emerald-500' },
                    { label: 'Awaiting Response',   value: rfqCounts.awaiting, icon: Clock,     border: 'border-amber-500'   },
                ].map(s => (
                    <div key={s.label} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.border} flex items-center gap-3`}>
                        <s.icon size={24} className="text-gray-200 shrink-0" />
                        <div>
                            <p className="text-2xl font-extrabold text-gray-800">{loadingRFQ ? '—' : s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                    <AlertCircle size={15} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {loadingRFQ ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-indigo-400" size={36} />
                </div>
            ) : rfqs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Inbox size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-lg">No RFQs yet</p>
                    <p className="text-sm mt-1">Go to <strong>RFQ Requests</strong> to create your first RFQ.</p>
                </div>
            ) : (
                <>
                    {/* RFQ tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                        {rfqs.map(r => (
                            <button key={r._id} onClick={() => setActiveRFQ(r._id)}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    activeRFQ === r._id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
                                }`}>
                                <span>{r.rfqNumber}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    r.responseCount > 0
                                        ? activeRFQ === r._id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                                        : activeRFQ === r._id ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                                }`}>{r.responseCount} resp.</span>
                            </button>
                        ))}
                    </div>

                    {/* Active RFQ panel */}
                    {activeRFQ && (() => {
                        const rfq = rfqs.find(r => r._id === activeRFQ);
                        if (!rfq) return null;
                        return (
                            <div className="space-y-5">
                                {/* RFQ summary card */}
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h2 className="text-base font-bold text-gray-800">{rfq.rfqNumber}</h2>
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                                    rfq.responseCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {rfq.responseCount > 0 ? 'Responses Received' : 'Awaiting Responses'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">{rfq.productName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{rfq.quantity} · {rfq.deliveryLocation}</p>
                                        </div>
                                        <div className="text-right text-xs text-gray-400">
                                            <p>Sent: {new Date(rfq.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                                            {rfq.deadline && <p>Deadline: {new Date(rfq.deadline).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>}
                                        </div>
                                    </div>
                                </div>

                                {loadingCmp ? (
                                    <div className="flex items-center justify-center h-32">
                                        <Loader2 className="animate-spin text-indigo-400" size={28} />
                                    </div>
                                ) : responses.length === 0 ? (
                                    <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
                                        <Clock size={40} className="mx-auto mb-3 text-gray-200" />
                                        <p className="text-sm font-medium text-gray-500">No responses yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Vendors typically respond within 4–24 hours.</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Recommendation banner */}
                                        {recommended && (
                                            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                                        <Trophy size={18} className="text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-0.5">Best Vendor Recommendation</p>
                                                        <h3 className="text-base font-bold text-indigo-900">{recommended.vendor}</h3>
                                                        <p className="text-xs text-indigo-600 mt-0.5">
                                                            Composite score: <strong>{recommended.score}/100</strong> — price (35%), rating (30%), delivery (25%), discount (10%)
                                                        </p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-2xl font-extrabold text-indigo-900">
                                                            ₹{Math.round(recommended.price * (1 - recommended.discount / 100)).toLocaleString('en-IN')}
                                                        </p>
                                                        <p className="text-xs text-indigo-500">After {recommended.discount}% discount</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Comparison table */}
                                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-gray-800">Response Comparison</h3>
                                                <span className="text-xs text-gray-400">{responses.length} vendor{responses.length !== 1 ? 's' : ''} responded</span>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-gray-50 border-b border-gray-100">
                                                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                                                            {[
                                                                { field: 'price',    label: 'Base Price',   icon: DollarSign  },
                                                                { field: null,       label: 'Discount',     icon: TrendingDown },
                                                                { field: 'freight',  label: 'Freight',      icon: Truck       },
                                                                { field: 'delivery', label: 'Delivery',     icon: Clock       },
                                                                { field: 'rating',   label: 'Rating',       icon: Star        },
                                                                { field: null,       label: 'Payment',      icon: null        },
                                                            ].map(col => (
                                                                <th key={col.label}
                                                                    onClick={() => col.field && handleSort(col.field)}
                                                                    className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right ${col.field ? 'cursor-pointer hover:text-indigo-600 select-none' : ''}`}>
                                                                    <span className="inline-flex items-center gap-1 justify-end">
                                                                        {col.label}
                                                                        {col.field && <SortIcon field={col.field} sortBy={sortBy} dir={sortDir} />}
                                                                    </span>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {sorted.map((resp, i) => {
                                                            const isBestPrice    = resp.vendor === bests.price;
                                                            const isBestRating   = resp.vendor === bests.rating;
                                                            const isBestDelivery = resp.vendor === bests.delivery;
                                                            const isRecommended  = resp.vendor === recommended?.vendor;
                                                            return (
                                                                <tr key={i} className={`hover:bg-gray-50 transition ${isRecommended ? 'bg-indigo-50/40' : ''}`}>
                                                                    <td className="px-5 py-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                                                                {resp.vendor.charAt(0)}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-gray-800">{resp.vendor}</p>
                                                                                {isRecommended && (
                                                                                    <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5">
                                                                                        <Trophy size={9} /> Recommended
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right">
                                                                        <p className="font-semibold text-gray-800">₹{resp.price?.toLocaleString('en-IN')}</p>
                                                                        <p className="text-xs text-gray-400">Effective: ₹{resp.effectivePrice?.toLocaleString('en-IN')}</p>
                                                                        {isBestPrice && <BestBadge label="Best Price" />}
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right">
                                                                        <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                                            {resp.discount}% off
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right">
                                                                        <span className={`text-xs font-medium ${resp.deliveryCharges === 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                                            {resp.deliveryCharges === 0 ? 'Free' : `₹${resp.deliveryCharges?.toLocaleString('en-IN')}`}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right">
                                                                        <div className="flex flex-col items-end gap-1">
                                                                            <span className="text-xs font-semibold text-gray-700">{resp.deliveryTime} days</span>
                                                                            {isBestDelivery && <BestBadge label="Fastest" />}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right">
                                                                        <div className="flex flex-col items-end gap-1">
                                                                            <div className="flex items-center gap-1 justify-end">
                                                                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                                                                <span className="text-xs font-semibold text-gray-700">{resp.rating || '—'}</span>
                                                                            </div>
                                                                            {isBestRating && <BestBadge label="Top Rated" />}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-4 text-right">
                                                                        <span className="text-xs text-gray-500">{resp.paymentTerms || '—'}</span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* KPI analysis */}
                                        <div className="grid sm:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Best Price',       value: `₹${Math.min(...responses.map(r => r.price)).toLocaleString('en-IN')}`,            icon: DollarSign,  vendor: bests.price    },
                                                { label: 'Best Rating',      value: `${Math.max(...responses.map(r => r.rating || 0))} / 5`,                           icon: Star,        vendor: bests.rating   },
                                                { label: 'Fastest Delivery', value: `${Math.min(...responses.map(r => parseInt(r.deliveryTime) || 99))} days`,         icon: Zap,         vendor: bests.delivery },
                                                { label: 'Best Discount',    value: `${Math.max(...responses.map(r => r.discount || 0))}% off`,                        icon: TrendingDown, vendor: responses.find(r => r.discount === Math.max(...responses.map(x => x.discount || 0)))?.vendor },
                                            ].map(k => (
                                                <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <k.icon size={15} className="text-indigo-500" />
                                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</span>
                                                    </div>
                                                    <p className="text-lg font-extrabold text-gray-800">{k.value}</p>
                                                    <p className="text-xs text-indigo-600 font-medium mt-0.5 truncate">{k.vendor || '—'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </>
            )}
        </div>
    );
}
