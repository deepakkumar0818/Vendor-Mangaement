import { useState, useMemo } from 'react';
import {
    Inbox, Star, TrendingDown, Truck, Clock, Award,
    ChevronUp, ChevronDown, Trophy, BadgeCheck, BarChart3,
    DollarSign, Zap, ArrowUpDown,
} from 'lucide-react';

const MOCK_RFQS = [
    {
        id: 'RFQ-1043',
        product: 'Steel Coils (Grade HR)',
        category: 'Raw Materials',
        quantity: '500 units',
        location: 'Mumbai Warehouse',
        deadline: '2026-03-20',
        status: 'Responses Received',
        sentAt: '2026-03-10',
        responses: [
            { vendor: 'AlphaTech Supplies', price: 210000, discount: 8, deliveryTime: '5 days', freight: 3500, rating: 4.8, responseTime: '1.5 hrs', warranty: '12 months', paymentTerms: 'Net 30' },
            { vendor: 'ProBuild Materials', price: 198000, discount: 5, deliveryTime: '7 days', freight: 0,    rating: 4.3, responseTime: '4 hrs',   warranty: '6 months',  paymentTerms: 'Net 15' },
            { vendor: 'FastTrack Systems',  price: 225000, discount: 12, deliveryTime: '4 days', freight: 2000, rating: 4.5, responseTime: '2 hrs', warranty: '18 months', paymentTerms: 'Net 45' },
        ],
    },
    {
        id: 'RFQ-1042',
        product: 'Corrugated Packaging Boxes',
        category: 'Packaging',
        quantity: '2000 units',
        location: 'Delhi Warehouse',
        deadline: '2026-03-25',
        status: 'Awaiting Responses',
        sentAt: '2026-03-11',
        responses: [],
    },
    {
        id: 'RFQ-1041',
        product: 'ERP Software License',
        category: 'IT & Software',
        quantity: '50 licenses',
        location: 'Bangalore Office',
        deadline: '2026-04-01',
        status: 'Responses Received',
        sentAt: '2026-03-08',
        responses: [
            { vendor: 'FastTrack Systems', price: 85000,  discount: 10, deliveryTime: '2 days', freight: 0,    rating: 4.5, responseTime: '45 min', warranty: '24 months', paymentTerms: 'Net 30' },
            { vendor: 'CloudBase IT',      price: 72000,  discount: 5,  deliveryTime: '3 days', freight: 0,    rating: 3.8, responseTime: '6 hrs',  warranty: '12 months', paymentTerms: 'Advance' },
        ],
    },
];

function StarRating({ value, size = 13 }) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={size} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
        </span>
    );
}

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
    const [activeRFQ, setActiveRFQ] = useState(MOCK_RFQS[0].id);
    const [sortBy,    setSortBy]    = useState('price');
    const [sortDir,   setSortDir]   = useState('asc');

    const rfq = MOCK_RFQS.find(r => r.id === activeRFQ);

    const sorted = useMemo(() => {
        if (!rfq?.responses?.length) return [];
        return [...rfq.responses].sort((a, b) => {
            let va, vb;
            if (sortBy === 'price')    { va = a.price;    vb = b.price;    }
            else if (sortBy === 'delivery') { va = parseInt(a.deliveryTime); vb = parseInt(b.deliveryTime); }
            else if (sortBy === 'rating')   { va = a.rating;  vb = b.rating;   sortDir === 'asc' ? null : null; }
            else if (sortBy === 'freight')  { va = a.freight; vb = b.freight;  }
            else return 0;
            return sortDir === 'asc' ? va - vb : vb - va;
        });
    }, [rfq, sortBy, sortDir]);

    const handleSort = field => {
        if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(field); setSortDir('asc'); }
    };

    // Determine bests
    const bests = useMemo(() => {
        if (!rfq?.responses?.length) return {};
        const r = rfq.responses;
        const effectivePrices = r.map(x => x.price * (1 - x.discount / 100) + x.freight);
        const minPrice = Math.min(...effectivePrices);
        const maxRating = Math.max(...r.map(x => x.rating));
        const minDelivery = Math.min(...r.map(x => parseInt(x.deliveryTime)));
        return {
            price:    r[effectivePrices.indexOf(minPrice)]?.vendor,
            rating:   r.find(x => x.rating === maxRating)?.vendor,
            delivery: r.find(x => parseInt(x.deliveryTime) === minDelivery)?.vendor,
        };
    }, [rfq]);

    // Recommendation score
    const recommended = useMemo(() => {
        if (!rfq?.responses?.length) return null;
        const r = rfq.responses;
        const maxP = Math.max(...r.map(x => x.price));
        const minP = Math.min(...r.map(x => x.price));
        const maxDel = Math.max(...r.map(x => parseInt(x.deliveryTime)));
        const minDel = Math.min(...r.map(x => parseInt(x.deliveryTime)));

        const scored = r.map(x => {
            const priceScore    = maxP === minP ? 50 : ((maxP - x.price) / (maxP - minP)) * 100;
            const delivScore    = maxDel === minDel ? 50 : ((maxDel - parseInt(x.deliveryTime)) / (maxDel - minDel)) * 100;
            const discountScore = x.discount;
            const ratingScore   = (x.rating / 5) * 100;
            const total = priceScore * 0.35 + ratingScore * 0.30 + delivScore * 0.25 + discountScore * 0.10;
            return { ...x, score: Math.round(total) };
        });
        return scored.sort((a, b) => b.score - a.score)[0];
    }, [rfq]);

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Inbox className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vendor Responses</h1>
                    <p className="text-sm text-gray-400">Track and compare quotations from vendors</p>
                </div>
            </div>

            {/* RFQ summary cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'RFQs Sent',           value: MOCK_RFQS.length,                                          icon: Inbox,    border: 'border-indigo-500' },
                    { label: 'Responses Received',  value: MOCK_RFQS.filter(r => r.responses.length > 0).length,      icon: BadgeCheck, border: 'border-emerald-500' },
                    { label: 'Awaiting Response',   value: MOCK_RFQS.filter(r => r.responses.length === 0).length,    icon: Clock,    border: 'border-amber-500'   },
                ].map(s => (
                    <div key={s.label} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${s.border} flex items-center gap-3`}>
                        <s.icon size={24} className="text-gray-200 shrink-0" />
                        <div>
                            <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-400">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* RFQ tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {MOCK_RFQS.map(r => (
                    <button
                        key={r.id}
                        onClick={() => setActiveRFQ(r.id)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeRFQ === r.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
                        }`}
                    >
                        <span>{r.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            r.responses.length > 0
                                ? activeRFQ === r.id ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                                : activeRFQ === r.id ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                        }`}>{r.responses.length} resp.</span>
                    </button>
                ))}
            </div>

            {rfq && (
                <div className="space-y-5">
                    {/* RFQ detail card */}
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-base font-bold text-gray-800">{rfq.id}</h2>
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                        rfq.responses.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                    }`}>{rfq.status}</span>
                                </div>
                                <p className="text-sm text-gray-600 font-medium">{rfq.product}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{rfq.quantity} · {rfq.location}</p>
                            </div>
                            <div className="text-right text-xs text-gray-400">
                                <p>Sent: {rfq.sentAt}</p>
                                <p>Deadline: {rfq.deadline}</p>
                            </div>
                        </div>
                    </div>

                    {rfq.responses.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-xl p-16 text-center shadow-sm">
                            <Clock size={40} className="mx-auto mb-3 text-gray-200" />
                            <p className="text-sm font-medium text-gray-500">No responses yet</p>
                            <p className="text-xs text-gray-400 mt-1">Vendors typically respond within 4–24 hours.</p>
                        </div>
                    ) : (
                        <>
                            {/* Best vendor recommendation */}
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
                                                Composite score: <strong>{recommended.score}/100</strong> based on price (35%), rating (30%), delivery (25%), discount (10%)
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-2xl font-extrabold text-indigo-900">
                                                ₹{(recommended.price * (1 - recommended.discount / 100)).toLocaleString('en-IN')}
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
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-300 inline-block" /> Best</span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</th>
                                                {[
                                                    { field: 'price',    label: 'Base Price',     icon: DollarSign },
                                                    { field: null,       label: 'Discount',       icon: TrendingDown },
                                                    { field: 'freight',  label: 'Freight',        icon: Truck },
                                                    { field: 'delivery', label: 'Delivery Time',  icon: Clock },
                                                    { field: 'rating',   label: 'Rating',         icon: Star },
                                                    { field: null,       label: 'Payment Terms',  icon: null },
                                                ].map(col => (
                                                    <th
                                                        key={col.label}
                                                        onClick={() => col.field && handleSort(col.field)}
                                                        className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right ${col.field ? 'cursor-pointer hover:text-indigo-600 select-none' : ''}`}
                                                    >
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
                                                const effective = resp.price * (1 - resp.discount / 100) + resp.freight;
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
                                                                    <p className="text-xs text-gray-400">Responded in {resp.responseTime}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <p className="font-semibold text-gray-800">₹{resp.price.toLocaleString('en-IN')}</p>
                                                            <p className="text-xs text-gray-400">Effective: ₹{Math.round(effective).toLocaleString('en-IN')}</p>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                                                {resp.discount}% off
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className={`text-xs font-medium ${resp.freight === 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                                {resp.freight === 0 ? 'Free' : `₹${resp.freight.toLocaleString('en-IN')}`}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <span className="text-xs font-semibold text-gray-700">{resp.deliveryTime}</span>
                                                                {isBestDelivery && <BestBadge label="Fastest" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="flex flex-col items-end gap-1">
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                                                    <span className="text-xs font-semibold text-gray-700">{resp.rating}</span>
                                                                </div>
                                                                {isBestRating && <BestBadge label="Top Rated" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <span className="text-xs text-gray-500">{resp.paymentTerms}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* KPI analysis row */}
                            <div className="grid sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Best Price', value: `₹${Math.min(...rfq.responses.map(r => r.price)).toLocaleString('en-IN')}`, icon: DollarSign, vendor: bests.price },
                                    { label: 'Best Rating', value: `${Math.max(...rfq.responses.map(r => r.rating))} / 5`, icon: Star, vendor: bests.rating },
                                    { label: 'Fastest Delivery', value: `${Math.min(...rfq.responses.map(r => parseInt(r.deliveryTime)))} days`, icon: Zap, vendor: bests.delivery },
                                    { label: 'Best Discount', value: `${Math.max(...rfq.responses.map(r => r.discount))}% off`, icon: TrendingDown, vendor: rfq.responses.find(r => r.discount === Math.max(...rfq.responses.map(x => x.discount)))?.vendor },
                                ].map(k => (
                                    <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <k.icon size={15} className="text-indigo-500" />
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{k.label}</span>
                                        </div>
                                        <p className="text-lg font-extrabold text-gray-800">{k.value}</p>
                                        <p className="text-xs text-indigo-600 font-medium mt-0.5 truncate">{k.vendor}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
