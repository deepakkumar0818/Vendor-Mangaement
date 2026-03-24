import { useState, useEffect, useCallback } from 'react';
import {
    GitCompare, CheckCircle, XCircle, Trophy, Clock, Loader2,
    DollarSign, Truck, ShieldCheck, Headphones, BarChart2, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

// ── Dummy placeholder slots — shown while vendors haven't responded yet ─────────
const DUMMY_POOL = [
    {
        id: 'ph1', name: 'Vendor A', isLive: false,
        price: 4800, discount: 7,  paymentTerms: 'Net 30', freight: 300,
        leadTime: 5,  onTimeRate: '91%', coverage: 'Pan India',
        iso: true,  defect: '1.2%', warranty: '12 months', msds: true,
        respTime: '8 hrs',  accMgr: true,  afterSales: '24 / 7',       tracking: true,
        score: 82, cls: 'Regular',   repeat: '71%',
    },
    {
        id: 'ph2', name: 'Vendor B', isLive: false,
        price: 5200, discount: 5,  paymentTerms: 'Net 15', freight: 0,
        leadTime: 3,  onTimeRate: '88%', coverage: 'Regional',
        iso: false, defect: '2.0%', warranty: '6 months',  msds: true,
        respTime: '24 hrs', accMgr: false, afterSales: 'Business hrs', tracking: false,
        score: 74, cls: 'Regular',   repeat: '58%',
    },
    {
        id: 'ph3', name: 'Vendor C', isLive: false,
        price: 3950, discount: 11, paymentTerms: 'Net 45', freight: 200,
        leadTime: 4,  onTimeRate: '93%', coverage: 'Pan India',
        iso: true,  defect: '1.0%', warranty: '18 months', msds: true,
        respTime: '6 hrs',  accMgr: true,  afterSales: '24 / 7',       tracking: true,
        score: 89, cls: 'Preferred', repeat: '76%',
    },
];

// Convert a live API response object into the unified slot shape
function liveToSlot(r) {
    const score = r.rating ? Math.round(r.rating * 20) : 80;
    return {
        id:           r.vendor,
        name:         r.vendor,
        isLive:       true,
        price:        r.price,
        discount:     r.discount || 0,
        paymentTerms: r.paymentTerms || 'Net 30',
        freight:      r.deliveryCharges || 0,
        leadTime:     parseInt(r.deliveryTime) || null,
        onTimeRate:   null,   // not returned by API
        coverage:     null,
        iso:          null,
        defect:       null,
        warranty:     r.warranty || null,
        msds:         null,
        respTime:     null,
        accMgr:       null,
        afterSales:   null,
        tracking:     null,
        score:        score,
        cls:          score >= 80 ? 'Preferred' : score >= 60 ? 'Regular' : 'Monitor',
        repeat:       null,
        effectivePrice: r.effectivePrice,
    };
}

// ── Comparison row definitions ─────────────────────────────────────────────────
const SECTIONS = [
    {
        category: 'Pricing', icon: DollarSign,
        rows: [
            { label: 'Unit Price (per 100 units)', key: 'price',        format: v => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : null, winDir: 'min' },
            { label: 'Bulk Discount',              key: 'discount',     format: v => v != null ? `${v}%` : null,                                  winDir: 'max' },
            { label: 'Payment Terms',              key: 'paymentTerms', format: v => v || null,                                                   winDir: null  },
            { label: 'Freight / Delivery Cost',    key: 'freight',      format: v => v === 0 ? 'Free' : v != null ? `₹${Number(v).toLocaleString('en-IN')}` : null, winDir: 'min' },
        ],
    },
    {
        category: 'Delivery', icon: Truck,
        rows: [
            { label: 'Lead Time',             key: 'leadTime',   format: v => v != null ? `${v} days` : null, winDir: 'min'  },
            { label: 'On-Time Delivery Rate', key: 'onTimeRate', format: v => v || null,                      winDir: null   },
            { label: 'Delivery Coverage',     key: 'coverage',   format: v => v || null,                      winDir: null   },
        ],
    },
    {
        category: 'Quality & Compliance', icon: ShieldCheck,
        rows: [
            { label: 'ISO Certified',        key: 'iso',      format: v => v,         winDir: 'bool' },
            { label: 'Defect / Return Rate', key: 'defect',   format: v => v || null, winDir: null   },
            { label: 'Quality Warranty',     key: 'warranty', format: v => v || null, winDir: null   },
            { label: 'MSDS / Safety Docs',   key: 'msds',     format: v => v,         winDir: 'bool' },
        ],
    },
    {
        category: 'Service', icon: Headphones,
        rows: [
            { label: 'Avg. RFQ Response Time',    key: 'respTime',   format: v => v || null, winDir: null   },
            { label: 'Dedicated Account Manager', key: 'accMgr',     format: v => v,         winDir: 'bool' },
            { label: 'After-Sales Support',        key: 'afterSales', format: v => v || null, winDir: null   },
            { label: 'Order Tracking Portal',      key: 'tracking',   format: v => v,         winDir: 'bool' },
        ],
    },
    {
        category: 'Performance Score', icon: BarChart2,
        rows: [
            { label: 'Overall Vendor Score', key: 'score',  format: v => v != null ? `${v} / 100` : null, winDir: 'max' },
            { label: 'Classification',       key: 'cls',    format: v => v || null,                       winDir: null  },
            { label: 'Repeat Order Rate',    key: 'repeat', format: v => v || null,                       winDir: null  },
        ],
    },
];

const BOOL_KEYS = new Set(['iso', 'msds', 'accMgr', 'tracking']);
const ALL_ROWS  = SECTIONS.flatMap(s => s.rows);

// Returns array of slot indices that win this row
function getWinners(slots, row) {
    if (row.winDir === null) return [];

    if (row.winDir === 'bool') {
        return slots.reduce((acc, s, i) => { if (s[row.key] === true) acc.push(i); return acc; }, []);
    }

    const nums = slots.map(s => {
        const v = s[row.key];
        if (v == null) return NaN;
        return typeof v === 'number' ? v : parseFloat(v);
    });

    const valid = nums.filter(n => !isNaN(n));
    if (!valid.length) return [];

    const best = row.winDir === 'min' ? Math.min(...valid) : Math.max(...valid);
    return nums.reduce((acc, n, i) => { if (n === best) acc.push(i); return acc; }, []);
}

// ── Cell renderer ──────────────────────────────────────────────────────────────
function CellValue({ slot, rowDef, isWinner }) {
    const raw = slot[rowDef.key];

    if (BOOL_KEYS.has(rowDef.key)) {
        if (raw === null || raw === undefined) {
            return <span className="text-xs text-gray-300 italic">—</span>;
        }
        return raw
            ? <CheckCircle size={16} className={`mx-auto ${isWinner ? 'text-emerald-600' : 'text-emerald-400'}`} />
            : <XCircle    size={16} className="mx-auto text-rose-400" />;
    }

    const formatted = rowDef.format(raw);
    if (formatted === null || formatted === undefined) {
        return <span className={`text-xs ${slot.isLive ? 'text-gray-300' : 'text-gray-400 italic'}`}>—</span>;
    }

    return (
        <span className={`text-sm ${
            isWinner     ? 'text-emerald-700 font-semibold' :
            slot.isLive  ? 'font-medium text-gray-700'      :
                           'text-gray-500 italic'
        }`}>
            {formatted}
        </span>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PriceComparison() {
    const { authFetch } = useAuth();

    const [rfqs,       setRfqs]       = useState([]);
    const [activeRFQ,  setActiveRFQ]  = useState(null);
    const [liveData,   setLiveData]   = useState(null);
    const [loadingRFQ, setLoadingRFQ] = useState(true);
    const [loadingCmp, setLoadingCmp] = useState(false);

    // ── Load RFQs ────────────────────────────────────────────────────────────────
    const loadRFQs = useCallback(async () => {
        setLoadingRFQ(true);
        try {
            const res  = await authFetch(`${API}/rfq`);
            const data = await res.json();
            const list = data.rfqs || [];
            setRfqs(list);
            if (list.length) setActiveRFQ(list[0]._id);
        } catch {
            // silently fall back to all-dummy mode
        } finally {
            setLoadingRFQ(false);
        }
    }, [authFetch]);

    useEffect(() => { loadRFQs(); }, [loadRFQs]);

    // ── Load comparison for selected RFQ ─────────────────────────────────────────
    useEffect(() => {
        if (!activeRFQ) { setLiveData(null); return; }
        setLoadingCmp(true);
        authFetch(`${API}/rfq/${activeRFQ}/comparison`)
            .then(r => r.json())
            .then(d => setLiveData(d))
            .catch(() => setLiveData(null))
            .finally(() => setLoadingCmp(false));
    }, [activeRFQ, authFetch]);

    // ── Build slots ───────────────────────────────────────────────────────────────
    // Only treat as "live" when the backend used actual vendor responses, not catalog
    const realResponses = liveData?.dataSource === 'responses' ? (liveData.comparison || []) : [];
    const liveSlots     = realResponses.slice(0, 4).map(liveToSlot);
    const dummyCount    = Math.max(0, 3 - liveSlots.length);
    const slots         = [...liveSlots, ...DUMMY_POOL.slice(0, dummyCount)];

    // ── Win counts ────────────────────────────────────────────────────────────────
    const winCounts = slots.map((_, si) =>
        ALL_ROWS.filter(row => {
            const w = getWinners(slots, row);
            return w.length === 1 && w[0] === si;
        }).length
    );
    const liveWinCounts = slots.map((s, i) => s.isLive ? winCounts[i] : -1);
    const bestIdx       = liveWinCounts.some(n => n >= 0)
        ? liveWinCounts.indexOf(Math.max(...liveWinCounts))
        : winCounts.indexOf(Math.max(...winCounts));

    const CRITERION_W = 220;
    const VENDOR_W    = 200;
    const tableW      = CRITERION_W + slots.length * VENDOR_W;

    const activeRFQObj = rfqs.find(r => r._id === activeRFQ);

    // ── Loading spinner ───────────────────────────────────────────────────────────
    if (loadingRFQ) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-indigo-400" size={36} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-full mx-auto space-y-6">

            {/* ── Page header ── */}
            <div className="flex items-center gap-3">
                <GitCompare className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Price Comparison</h1>
                    <p className="text-sm text-gray-400">Live vendor responses replace estimated data as quotes arrive</p>
                </div>
            </div>

            {/* ── RFQ selector ── */}
            {rfqs.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Select RFQ to compare</p>
                    <div className="flex gap-2 flex-wrap">
                        {rfqs.map(r => (
                            <button key={r._id} onClick={() => setActiveRFQ(r._id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    activeRFQ === r._id
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}>
                                {r.rfqNumber}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                    r.responseCount > 0
                                        ? activeRFQ === r._id ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                                        : activeRFQ === r._id ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                                }`}>{r.responseCount} resp.</span>
                            </button>
                        ))}
                    </div>

                    {activeRFQObj && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">{activeRFQObj.productName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{activeRFQObj.quantity} · {activeRFQObj.deliveryLocation}</p>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                activeRFQObj.responseCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                                {activeRFQObj.responseCount > 0
                                    ? `${activeRFQObj.responseCount} vendor${activeRFQObj.responseCount !== 1 ? 's' : ''} responded`
                                    : 'Awaiting responses'}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Comparison loading ── */}
            {loadingCmp && (
                <div className="flex items-center justify-center h-16">
                    <Loader2 className="animate-spin text-indigo-400" size={26} />
                </div>
            )}

            {!loadingCmp && (
                <>
                    {/* ── Legend ── */}
                    <div className="flex items-center gap-5 text-xs flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-gray-600 font-medium">
                                {liveSlots.length > 0
                                    ? `${liveSlots.length} vendor${liveSlots.length !== 1 ? 's' : ''} responded — live data`
                                    : 'Responded vendors will appear here'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-gray-400">
                                {dummyCount > 0
                                    ? `${dummyCount} slot${dummyCount !== 1 ? 's' : ''} awaiting response — estimated data`
                                    : 'All vendors have responded'}
                            </span>
                        </div>
                    </div>

                    {/* ── No-response info banner ── */}
                    {liveSlots.length === 0 && (
                        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                            <Zap size={16} className="text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-amber-800">
                                <strong>Estimated Data</strong> — No vendors have responded to this RFQ yet.
                                The comparison below uses sample placeholder data.
                                As vendors submit quotes, their actual data will replace these estimates automatically.
                            </p>
                        </div>
                    )}

                    {/* ── Win-count summary ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <div style={{ minWidth: `${tableW}px` }} className="flex">
                                <div style={{ width: `${CRITERION_W}px`, flexShrink: 0 }} className="px-5 py-4 border-r border-gray-100 flex items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{ALL_ROWS.length} Total Criteria</span>
                                </div>
                                {slots.map((slot, idx) => (
                                    <div key={slot.id} style={{ width: `${VENDOR_W}px`, flexShrink: 0 }}
                                        className={`px-4 py-4 text-center border-r border-gray-100 ${
                                            idx === bestIdx && slot.isLive ? 'bg-emerald-50' :
                                            slot.isLive ? 'bg-gray-50' : 'bg-amber-50/40'
                                        }`}>
                                        <p className={`text-2xl font-extrabold ${
                                            idx === bestIdx && slot.isLive ? 'text-emerald-600' :
                                            slot.isLive ? 'text-gray-700' : 'text-gray-300'
                                        }`}>
                                            {winCounts[idx]}
                                        </p>
                                        <p className={`text-xs mt-0.5 truncate ${slot.isLive ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {slot.name.split(' ')[0]}
                                        </p>
                                        {idx === bestIdx && slot.isLive ? (
                                            <span className="inline-block mt-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                                BEST OVERALL
                                            </span>
                                        ) : !slot.isLive ? (
                                            <span className="inline-block mt-1.5 text-[10px] font-medium bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                                                AWAITING
                                            </span>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Section cards ── */}
                    {SECTIONS.map(section => {
                        const Icon = section.icon;
                        return (
                            <div key={section.category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-indigo-400 bg-indigo-50">
                                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Icon size={15} className="text-indigo-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">{section.category}</h3>
                                </div>

                                <div className="overflow-x-auto">
                                    <table style={{ tableLayout: 'fixed', width: `${tableW}px`, minWidth: `${tableW}px` }}>
                                        <colgroup>
                                            <col style={{ width: `${CRITERION_W}px` }} />
                                            {slots.map((_, i) => <col key={i} style={{ width: `${VENDOR_W}px` }} />)}
                                        </colgroup>
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                                <th className="sticky left-0 z-10 bg-gray-50 px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-r border-gray-100">
                                                    Criterion
                                                </th>
                                                {slots.map((slot, idx) => (
                                                    <th key={idx} className={`px-4 py-2.5 text-center text-xs font-semibold border-l border-gray-100 ${slot.isLive ? 'text-gray-700' : 'text-gray-400'}`}>
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="truncate max-w-[150px]">{slot.name}</span>
                                                            {slot.isLive
                                                                ? <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ RESPONDED</span>
                                                                : <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-500">⏳ AWAITING · EST.</span>
                                                            }
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {section.rows.map((row, rowIdx) => {
                                                const winners = getWinners(slots, row);
                                                const isLast  = rowIdx === section.rows.length - 1;
                                                return (
                                                    <tr key={row.label}
                                                        className={`hover:bg-gray-50/60 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}>
                                                        <td className="sticky left-0 z-10 bg-white px-5 py-3.5 text-sm text-gray-600 font-medium border-r border-gray-100">
                                                            {row.label}
                                                        </td>
                                                        {slots.map((slot, idx) => {
                                                            const isWinner = winners.includes(idx);
                                                            return (
                                                                <td key={idx}
                                                                    className={`px-4 py-3.5 text-center border-l border-gray-100 ${
                                                                        isWinner && slot.isLive ? 'bg-emerald-50' :
                                                                        !slot.isLive ? 'bg-amber-50/20' : ''
                                                                    }`}>
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        <CellValue slot={slot} rowDef={row} isWinner={isWinner && slot.isLive} />
                                                                        {isWinner && slot.isLive && (
                                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                                                                                BEST
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}

                    {/* ── Winner banner (only when at least one real response) ── */}
                    {liveSlots.length > 0 ? (
                        <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <Trophy size={18} className="text-emerald-600" />
                                <span className="text-sm font-bold text-gray-700">
                                    Recommended Vendor:{' '}
                                    <span className="text-emerald-600">{slots[bestIdx]?.name}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                                {slots.map((s, i) => (
                                    <span key={i} className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        <span className={`font-bold ${i === bestIdx && s.isLive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {winCounts[i]}
                                        </span>
                                        {s.name.split(' ')[0]}
                                        {!s.isLive && <span className="text-amber-400 text-[9px]">est.</span>}
                                    </span>
                                ))}
                                <span className="text-xs text-gray-400">/ {ALL_ROWS.length} criteria</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 px-6 py-4 flex items-center gap-3">
                            <Clock size={16} className="text-gray-400 shrink-0" />
                            <p className="text-sm text-gray-500">
                                The recommended vendor will be highlighted here once vendors start responding to this RFQ.
                                Vendor{rfqs.length > 0 && activeRFQObj ? 's typically respond within 4–24 hours.' : ' comparison is ready — just waiting for quotes.'}
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
