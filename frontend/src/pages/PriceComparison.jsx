import { useState } from 'react';
import {
    GitCompare, CheckCircle, XCircle, Plus, X, Trophy,
    DollarSign, Truck, ShieldCheck, Headphones, BarChart2,
} from 'lucide-react';

const VENDORS = [
    'AlphaTech Supplies',
    'BlueOcean Materials',
    'FastTrack Logistics',
    'CheapBulk Co.',
];
const KEYS = ['a', 'b', 'c', 'd'];

const comparisonRows = [
    {
        category: 'Pricing',
        icon: DollarSign,
        rows: [
            { criterion: 'Unit Price (per 100 units)', a: '₹4,200', b: '₹5,100', c: '₹3,800', d: '₹4,900', winner: 'c' },
            { criterion: 'Bulk Discount (500+ units)', a: '8%',      b: '5%',      c: '12%',    d: '6%',     winner: 'c' },
            { criterion: 'Payment Terms',              a: 'Net 30',  b: 'Net 15',  c: 'Net 45', d: 'Net 30', winner: 'c' },
            { criterion: 'Freight / Delivery Cost',   a: '₹350',    b: 'Free',    c: '₹200',   d: 'Free',   winner: 'b' },
        ],
    },
    {
        category: 'Delivery',
        icon: Truck,
        rows: [
            { criterion: 'Lead Time',             a: '5 days',    b: '3 days',   c: '4 days',    d: '7 days',     winner: 'b' },
            { criterion: 'On-Time Delivery Rate', a: '96%',       b: '88%',      c: '92%',       d: '79%',        winner: 'a' },
            { criterion: 'Delivery Coverage',     a: 'Pan India', b: 'Regional', c: 'Pan India', d: 'Metro Only', winner: 'a' },
        ],
    },
    {
        category: 'Quality & Compliance',
        icon: ShieldCheck,
        rows: [
            { criterion: 'ISO Certified',        a: true,        b: false,       c: true,        d: false,       winner: 'a' },
            { criterion: 'Defect / Return Rate', a: '0.8%',      b: '2.1%',      c: '1.1%',      d: '3.2%',      winner: 'a' },
            { criterion: 'Quality Warranty',     a: '12 months', b: '6 months',  c: '18 months', d: '3 months',  winner: 'c' },
            { criterion: 'MSDS / Safety Docs',   a: true,        b: true,        c: true,        d: false,       winner: null },
        ],
    },
    {
        category: 'Service',
        icon: Headphones,
        rows: [
            { criterion: 'Avg. RFQ Response Time',    a: '4 hrs',  b: '24 hrs',       c: '8 hrs',  d: '48 hrs',     winner: 'a' },
            { criterion: 'Dedicated Account Manager', a: true,     b: false,          c: true,     d: false,        winner: 'a' },
            { criterion: 'After-Sales Support',       a: '24 / 7', b: 'Business hrs', c: '24 / 7', d: 'Email only', winner: 'a' },
            { criterion: 'Order Tracking Portal',     a: true,     b: false,          c: true,     d: false,        winner: 'a' },
        ],
    },
    {
        category: 'Performance Score',
        icon: BarChart2,
        rows: [
            { criterion: 'Overall Vendor Score', a: '94 / 100',  b: '78 / 100', c: '88 / 100',  d: '52 / 100', winner: 'a' },
            { criterion: 'Classification',       a: 'Preferred', b: 'Regular',  c: 'Preferred', d: 'Monitor',  winner: 'a' },
            { criterion: 'Repeat Order Rate',    a: '87%',       b: '62%',      c: '74%',       d: '38%',      winner: 'a' },
        ],
    },
];

const allRows = comparisonRows.flatMap(g => g.rows);
const totalCriteria = allRows.length;

function CellValue({ val, isWinner }) {
    if (typeof val === 'boolean') {
        return val
            ? <CheckCircle size={16} className="mx-auto text-emerald-500" />
            : <XCircle    size={16} className="mx-auto text-rose-400" />;
    }
    return (
        <span className={`text-sm font-medium ${isWinner ? 'text-emerald-700 font-semibold' : 'text-gray-600'}`}>
            {val}
        </span>
    );
}

export default function PriceComparison() {
    const [selectedVendors, setSelectedVendors] = useState([VENDORS[0], VENDORS[1]]);

    const selectedKeys = selectedVendors.map(name => KEYS[VENDORS.indexOf(name)]);

    const winCounts = selectedKeys.map(key =>
        allRows.filter(r => r.winner === key).length
    );

    const bestIdx    = winCounts.indexOf(Math.max(...winCounts));
    const bestVendor = selectedVendors[bestIdx];
    const available  = VENDORS.filter(v => !selectedVendors.includes(v));

    const addVendor = () => {
        if (available.length && selectedVendors.length < 4)
            setSelectedVendors(prev => [...prev, available[0]]);
    };

    const removeVendor = idx => {
        if (selectedVendors.length > 2)
            setSelectedVendors(prev => prev.filter((_, i) => i !== idx));
    };

    const changeVendor = (idx, name) =>
        setSelectedVendors(prev => prev.map((v, i) => i === idx ? name : v));

    const CRITERION_W = 220;
    const VENDOR_W    = 210;
    const tableW      = CRITERION_W + selectedVendors.length * VENDOR_W;

    return (
        <div className="p-6 max-w-full mx-auto space-y-6">

            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <GitCompare className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Price Comparison</h1>
                        <p className="text-sm text-gray-400">Compare up to 4 vendors side-by-side</p>
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

            {/* ── Vendor selector card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="overflow-x-auto">
                    <div style={{ minWidth: `${tableW}px` }}>
                        <div className="flex gap-0">
                            {/* Spacer for criterion column */}
                            <div style={{ width: `${CRITERION_W}px`, flexShrink: 0 }}>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-6">Criterion</p>
                            </div>
                            {/* Vendor selectors */}
                            {selectedVendors.map((vendor, idx) => (
                                <div key={idx} style={{ width: `${VENDOR_W}px`, flexShrink: 0 }} className="px-3">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            Vendor {String.fromCharCode(65 + idx)}
                                        </span>
                                        {selectedVendors.length > 2 && (
                                            <button
                                                onClick={() => removeVendor(idx)}
                                                className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                                            >
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                    <select
                                        value={vendor}
                                        onChange={e => changeVendor(idx, e.target.value)}
                                        className="w-full appearance-none border border-gray-200 text-gray-800 font-semibold text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                    >
                                        {VENDORS
                                            .filter(v => v === vendor || !selectedVendors.includes(v))
                                            .map(v => <option key={v}>{v}</option>)
                                        }
                                    </select>
                                </div>
                            ))}
                            {/* Add vendor inline button */}
                            {selectedVendors.length < 4 && available.length > 0 && (
                                <div className="flex items-end pb-0.5 pl-2" style={{ flexShrink: 0 }}>
                                    <button
                                        onClick={addVendor}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-dashed border-indigo-300 px-3 py-2 rounded-xl hover:bg-indigo-50 transition whitespace-nowrap"
                                    >
                                        <Plus size={13} /> Add Vendor
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Win count summary card ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <div style={{ minWidth: `${tableW}px` }} className="flex">
                        <div style={{ width: `${CRITERION_W}px`, flexShrink: 0 }} className="px-5 py-4 border-r border-gray-100 flex items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{totalCriteria} Total Criteria</span>
                        </div>
                        {selectedVendors.map((vendor, idx) => (
                            <div
                                key={idx}
                                style={{ width: `${VENDOR_W}px`, flexShrink: 0 }}
                                className={`px-4 py-4 text-center border-r border-gray-100 ${idx === bestIdx ? 'bg-emerald-50' : 'bg-gray-50'}`}
                            >
                                <p className={`text-2xl font-extrabold ${idx === bestIdx ? 'text-emerald-600' : 'text-gray-400'}`}>
                                    {winCounts[idx]}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 truncate">{vendor.split(' ')[0]}</p>
                                {idx === bestIdx && (
                                    <span className="inline-block mt-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                        BEST OVERALL
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Section cards ── */}
            {comparisonRows.map(group => {
                const Icon = group.icon;
                return (
                    <div key={group.category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Section header */}
                        <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-indigo-400 bg-indigo-50">
                            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                <Icon size={15} className="text-indigo-500" />
                            </div>
                            <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">{group.category}</h3>
                        </div>

                        {/* Section table */}
                        <div className="overflow-x-auto">
                            <table
                                style={{
                                    tableLayout: 'fixed',
                                    width: `${tableW}px`,
                                    minWidth: `${tableW}px`,
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: `${CRITERION_W}px` }} />
                                    {selectedVendors.map((_, i) => (
                                        <col key={i} style={{ width: `${VENDOR_W}px` }} />
                                    ))}
                                </colgroup>
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/60">
                                        <th className="sticky left-0 z-10 bg-gray-50 px-5 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-r border-gray-100">
                                            Criterion
                                        </th>
                                        {selectedVendors.map((vendor, idx) => (
                                            <th key={idx} className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500 border-l border-gray-100">
                                                {vendor}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.rows.map((row, rowIdx) => {
                                        const winnerKey    = row.winner;
                                        const winnerInView = winnerKey && selectedKeys.includes(winnerKey);
                                        const isLastRow    = rowIdx === group.rows.length - 1;

                                        return (
                                            <tr
                                                key={row.criterion}
                                                className={`hover:bg-gray-50/60 transition-colors ${!isLastRow ? 'border-b border-gray-100' : ''}`}
                                            >
                                                <td className="sticky left-0 z-10 bg-white px-5 py-3.5 text-sm text-gray-600 font-medium border-r border-gray-100">
                                                    {row.criterion}
                                                </td>
                                                {selectedKeys.map((key, idx) => {
                                                    const isWinner = winnerInView && key === winnerKey;
                                                    return (
                                                        <td
                                                            key={idx}
                                                            className={`px-4 py-3.5 text-center border-l border-gray-100 ${isWinner ? 'bg-emerald-50' : ''}`}
                                                        >
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <CellValue val={row[key]} isWinner={isWinner} />
                                                                {isWinner && (
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

            {/* ── Winner banner ── */}
            <div className="bg-emerald-50 rounded-2xl shadow-sm border border-emerald-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-emerald-600" />
                    <span className="text-sm font-bold text-gray-700">
                        Recommended Vendor:{' '}
                        <span className="text-emerald-600">{bestVendor}</span>
                    </span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                    {selectedVendors.map((v, i) => (
                        <span key={i} className="text-xs text-gray-500 font-medium">
                            <span className={`font-bold ${i === bestIdx ? 'text-emerald-600' : 'text-gray-500'}`}>
                                {winCounts[i]}
                            </span>{' '}
                            {v.split(' ')[0]}
                        </span>
                    ))}
                    <span className="text-xs text-gray-400">/ {totalCriteria} criteria</span>
                </div>
            </div>
        </div>
    );
}
