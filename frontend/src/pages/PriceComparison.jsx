import { useState } from 'react';
import { GitCompare, CheckCircle, XCircle, Plus, X, Trophy } from 'lucide-react';

// ── All available vendors (index maps to data key a/b/c/d) ────────────────────
const VENDORS = [
    'AlphaTech Supplies',
    'BlueOcean Materials',
    'FastTrack Logistics',
    'CheapBulk Co.',
];
const KEYS = ['a', 'b', 'c', 'd'];

// ── Per-slot visual style ──────────────────────────────────────────────────────
const SLOT_STYLES = [
    {
        label:    'Vendor A',
        select:   'bg-indigo-50 border-indigo-200 text-indigo-700 focus:ring-indigo-400',
        header:   'bg-indigo-50/40 text-indigo-600',
        winBg:    'bg-indigo-50',
        badge:    'bg-indigo-100 text-indigo-700',
        winsText: 'text-indigo-600',
        remove:   'hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600',
        dot:      'bg-indigo-500',
    },
    {
        label:    'Vendor B',
        select:   'bg-violet-50 border-violet-200 text-violet-700 focus:ring-violet-400',
        header:   'bg-violet-50/40 text-violet-600',
        winBg:    'bg-violet-50',
        badge:    'bg-violet-100 text-violet-700',
        winsText: 'text-violet-600',
        remove:   'hover:bg-violet-100 text-violet-400 hover:text-violet-600',
        dot:      'bg-violet-500',
    },
    {
        label:    'Vendor C',
        select:   'bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-400',
        header:   'bg-emerald-50/40 text-emerald-600',
        winBg:    'bg-emerald-50',
        badge:    'bg-emerald-100 text-emerald-700',
        winsText: 'text-emerald-600',
        remove:   'hover:bg-emerald-100 text-emerald-400 hover:text-emerald-600',
        dot:      'bg-emerald-500',
    },
    {
        label:    'Vendor D',
        select:   'bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-400',
        header:   'bg-amber-50/40 text-amber-600',
        winBg:    'bg-amber-50',
        badge:    'bg-amber-100 text-amber-700',
        winsText: 'text-amber-600',
        remove:   'hover:bg-amber-100 text-amber-400 hover:text-amber-600',
        dot:      'bg-amber-500',
    },
];

// ── Comparison data — a/b/c/d map to VENDORS[0..3] ───────────────────────────
const comparisonRows = [
    {
        category: 'Pricing',
        rows: [
            { criterion: 'Unit Price (per 100 units)', a: '₹4,200', b: '₹5,100', c: '₹3,800', d: '₹4,900', winner: 'c' },
            { criterion: 'Bulk Discount (500+ units)', a: '8%',      b: '5%',      c: '12%',    d: '6%',     winner: 'c' },
            { criterion: 'Payment Terms',              a: 'Net 30',  b: 'Net 15',  c: 'Net 45', d: 'Net 30', winner: 'c' },
            { criterion: 'Freight / Delivery Cost',   a: '₹350',    b: 'Free',    c: '₹200',   d: 'Free',   winner: 'b' },
        ],
    },
    {
        category: 'Delivery',
        rows: [
            { criterion: 'Lead Time',             a: '5 days',   b: '3 days',  c: '4 days',   d: '7 days',    winner: 'b' },
            { criterion: 'On-Time Delivery Rate', a: '96%',      b: '88%',     c: '92%',      d: '79%',       winner: 'a' },
            { criterion: 'Delivery Coverage',     a: 'Pan India',b: 'Regional',c: 'Pan India', d: 'Metro Only',winner: 'a' },
        ],
    },
    {
        category: 'Quality & Compliance',
        rows: [
            { criterion: 'ISO Certified',         a: true,       b: false,     c: true,       d: false,       winner: 'a' },
            { criterion: 'Defect / Return Rate',  a: '0.8%',     b: '2.1%',    c: '1.1%',     d: '3.2%',      winner: 'a' },
            { criterion: 'Quality Warranty',      a: '12 months',b: '6 months',c: '18 months',d: '3 months',  winner: 'c' },
            { criterion: 'MSDS / Safety Docs',    a: true,       b: true,      c: true,       d: false,       winner: null },
        ],
    },
    {
        category: 'Service',
        rows: [
            { criterion: 'Avg. RFQ Response Time',    a: '4 hrs',   b: '24 hrs',        c: '8 hrs',   d: '48 hrs',    winner: 'a' },
            { criterion: 'Dedicated Account Manager', a: true,      b: false,           c: true,      d: false,       winner: 'a' },
            { criterion: 'After-Sales Support',       a: '24 / 7',  b: 'Business hrs',  c: '24 / 7',  d: 'Email only',winner: 'a' },
            { criterion: 'Order Tracking Portal',     a: true,      b: false,           c: true,      d: false,       winner: 'a' },
        ],
    },
    {
        category: 'Performance Score',
        rows: [
            { criterion: 'Overall Vendor Score', a: '94 / 100',  b: '78 / 100',  c: '88 / 100',  d: '52 / 100',  winner: 'a' },
            { criterion: 'Classification',       a: 'Preferred', b: 'Regular',   c: 'Preferred', d: 'Monitor',   winner: 'a' },
            { criterion: 'Repeat Order Rate',    a: '87%',       b: '62%',       c: '74%',       d: '38%',       winner: 'a' },
        ],
    },
];

const allRows = comparisonRows.flatMap(g => g.rows);
const totalCriteria = allRows.length;

// ── Cell renderer ─────────────────────────────────────────────────────────────
function CellValue({ val, isWinner }) {
    if (typeof val === 'boolean') {
        return val
            ? <CheckCircle size={17} className="mx-auto text-emerald-500" />
            : <XCircle    size={17} className="mx-auto text-rose-400" />;
    }
    return <span className={`font-medium ${isWinner ? 'text-gray-900' : 'text-gray-600'}`}>{val}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PriceComparison() {
    // selectedVendors: array of vendor names, min 2 max 4
    const [selectedVendors, setSelectedVendors] = useState([VENDORS[0], VENDORS[1]]);

    // Map each selected vendor name → its data key ('a' | 'b' | 'c' | 'd')
    const selectedKeys = selectedVendors.map(name => KEYS[VENDORS.indexOf(name)]);

    // Win counts per selected vendor (only among selected set)
    const winCounts = selectedKeys.map(key =>
        allRows.filter(r => r.winner === key).length
    );

    const bestIdx   = winCounts.indexOf(Math.max(...winCounts));
    const bestVendor= selectedVendors[bestIdx];

    // Vendors not yet selected
    const available = VENDORS.filter(v => !selectedVendors.includes(v));

    const addVendor = () => {
        if (available.length && selectedVendors.length < 4) {
            setSelectedVendors(prev => [...prev, available[0]]);
        }
    };

    const removeVendor = idx => {
        if (selectedVendors.length > 2) {
            setSelectedVendors(prev => prev.filter((_, i) => i !== idx));
        }
    };

    const changeVendor = (idx, name) => {
        setSelectedVendors(prev => prev.map((v, i) => i === idx ? name : v));
    };

    return (
        <div className="p-6 max-w-full mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <GitCompare className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Price Comparison</h1>
                        <p className="text-sm text-gray-400">Compare up to 4 vendors side-by-side — scroll horizontally for more</p>
                    </div>
                </div>
                {selectedVendors.length < 4 && available.length > 0 && (
                    <button
                        onClick={addVendor}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200 shrink-0"
                    >
                        <Plus size={15} /> Add Vendor
                    </button>
                )}
            </div>

            {/* ── Main comparison card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* ── Vendor selector bar ── */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-end gap-3 overflow-x-auto pb-1">
                        {/* Criterion column label spacer */}
                        <div className="shrink-0 w-52 hidden md:block">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Criterion</p>
                        </div>

                        {/* Vendor selectors */}
                        {selectedVendors.map((vendor, idx) => {
                            const style = SLOT_STYLES[idx];
                            return (
                                <div key={idx} className="shrink-0 min-w-[180px] flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            {style.label}
                                        </label>
                                        {selectedVendors.length > 2 && (
                                            <button
                                                onClick={() => removeVendor(idx)}
                                                className={`p-0.5 rounded transition ${style.remove}`}
                                                title="Remove vendor"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <select
                                        value={vendor}
                                        onChange={e => changeVendor(idx, e.target.value)}
                                        className={`w-full appearance-none border font-semibold text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 pr-8 ${style.select}`}
                                    >
                                        {VENDORS
                                            .filter(v => v === vendor || !selectedVendors.includes(v))
                                            .map(v => <option key={v}>{v}</option>)
                                        }
                                    </select>
                                </div>
                            );
                        })}

                        {/* Add vendor inline button (when <4) */}
                        {selectedVendors.length < 4 && available.length > 0 && (
                            <div className="shrink-0 flex items-end pb-0.5">
                                <button
                                    onClick={addVendor}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-dashed border-indigo-300 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition whitespace-nowrap"
                                >
                                    <Plus size={13} /> Add Vendor
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Win count summary strip ── */}
                <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
                    {/* Spacer for criterion column */}
                    <div className="shrink-0 w-52 px-5 py-3 hidden md:flex items-center text-xs text-gray-400 font-semibold uppercase tracking-wide">
                        {totalCriteria} criteria
                    </div>

                    {selectedVendors.map((vendor, idx) => {
                        const style = SLOT_STYLES[idx];
                        return (
                            <div key={idx} className="flex-1 min-w-[180px] py-3 px-4 text-center border-l border-gray-100">
                                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                                    <p className="text-xs text-gray-500 font-medium truncate">{vendor.split(' ')[0]}</p>
                                </div>
                                <p className={`text-2xl font-extrabold ${style.winsText}`}>{winCounts[idx]}</p>
                                <p className="text-xs text-gray-400">criteria won</p>
                            </div>
                        );
                    })}
                </div>

                {/* ── Scrollable comparison table ── */}
                <div className="overflow-x-auto">
                    <table className="text-sm" style={{ minWidth: `${220 + selectedVendors.length * 200}px` }}>
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {/* Sticky criterion header */}
                                <th className="sticky left-0 z-10 bg-gray-50/90 backdrop-blur-sm text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-52 border-r border-gray-100">
                                    Criterion
                                </th>
                                {selectedVendors.map((vendor, idx) => (
                                    <th
                                        key={idx}
                                        className={`text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide min-w-[200px] ${SLOT_STYLES[idx].header}`}
                                    >
                                        {vendor}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonRows.map(group => (
                                <>
                                    {/* Category header row */}
                                    <tr key={group.category} className="bg-gray-50 border-y border-gray-100">
                                        <td
                                            colSpan={selectedVendors.length + 1}
                                            className="sticky left-0 px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50"
                                        >
                                            {group.category}
                                        </td>
                                    </tr>

                                    {group.rows.map(row => {
                                        // Determine which selected vendors win this criterion
                                        const winnerKey    = row.winner;
                                        const winnerInView = winnerKey && selectedKeys.includes(winnerKey);

                                        return (
                                            <tr key={row.criterion} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                {/* Sticky criterion label */}
                                                <td className="sticky left-0 z-10 bg-white px-5 py-3.5 text-gray-600 font-medium border-r border-gray-100 w-52">
                                                    {row.criterion}
                                                </td>

                                                {/* Vendor value cells */}
                                                {selectedKeys.map((key, idx) => {
                                                    const isWinner = winnerInView && key === winnerKey;
                                                    const style    = SLOT_STYLES[idx];
                                                    return (
                                                        <td
                                                            key={idx}
                                                            className={`px-4 py-3.5 text-center min-w-[200px] ${isWinner ? style.winBg : ''}`}
                                                        >
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <CellValue val={row[key]} isWinner={isWinner} />
                                                                {isWinner && (
                                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${style.badge}`}>
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
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Winner banner ── */}
                <div className={`px-6 py-4 flex items-center justify-between border-t border-gray-100 ${SLOT_STYLES[bestIdx].winBg}`}>
                    <div className="flex items-center gap-2">
                        <Trophy size={18} className={SLOT_STYLES[bestIdx].winsText} />
                        <span className="text-sm font-bold text-gray-700">
                            Recommended Vendor:{' '}
                            <span className={SLOT_STYLES[bestIdx].winsText}>{bestVendor}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedVendors.map((v, i) => (
                            <span key={i} className="text-xs text-gray-500 font-medium">
                                <span className={`font-bold ${SLOT_STYLES[i].winsText}`}>{winCounts[i]}</span> wins
                            </span>
                        ))}
                        <span className="text-xs text-gray-400">/ {totalCriteria} total</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
