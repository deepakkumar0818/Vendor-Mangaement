import { useState } from 'react';
import {
    Plus, Trash2, Trophy, ChevronRight, RotateCcw,
    Pencil, Loader2, AlertCircle, Medal
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const UNITS     = ['Nos', 'Kg', 'Ltrs', 'Pcs', 'Box', 'Set', 'Mtr', 'Sqft'];
const GST_RATES = [0, 5, 12, 18, 28];
const API_URL   = 'http://localhost:8000/api/smart-quote';

const VSTYLE = [
    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  header: 'bg-indigo-600',  badge: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500',  border: 'border-indigo-200'  },
    { bg: 'bg-violet-50',  text: 'text-violet-700',  header: 'bg-violet-600',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500',  border: 'border-violet-200'  },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', header: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
];

const MEDAL_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];

const fmt  = n => '₹' + new Intl.NumberFormat('en-IN').format(Number(n).toFixed(2));
const uid  = () => Math.random().toString(36).slice(2);

const emptyRow = () => ({
    id: uid(), description: '', brand: '', specs: '',
    unit: 'Nos', qty: '', target_price: '', gst: 18,
});

// ─── Small UI helpers ─────────────────────────────────────────────────────────
const TInput = ({ value, onChange, placeholder, type = 'text', className = '' }) => (
    <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-transparent text-xs text-gray-700 placeholder-gray-300
                    outline-none focus:bg-blue-50 rounded px-1.5 py-1 ${className}`}
    />
);

const TSelect = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent text-xs text-gray-700 outline-none
                   focus:bg-blue-50 rounded px-1.5 py-1 cursor-pointer"
    >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SmartQuote() {
    const [rows,    setRows]    = useState([emptyRow()]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');
    const [step,    setStep]    = useState(1); // 1=form  2=results

    // ── Row helpers ───────────────────────────────────────────────────────────
    const updateRow = (id, field, value) =>
        setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r));

    const addRow    = () => setRows(rs => [...rs, emptyRow()]);
    const deleteRow = id => setRows(rs => rs.length > 1 ? rs.filter(r => r.id !== id) : rs);

    const canSubmit = rows.some(r => r.description.trim() && r.qty && r.target_price);

    // ── API call ──────────────────────────────────────────────────────────────
    const fetchPredictions = async () => {
        setError('');
        setLoading(true);
        try {
            const payload = {
                items: rows
                    .filter(r => r.description.trim() && r.qty && r.target_price)
                    .map(r => ({
                        description:  r.description,
                        brand:        r.brand,
                        specs:        r.specs,
                        unit:         r.unit,
                        qty:          parseFloat(r.qty),
                        target_price: parseFloat(r.target_price),
                        gst:          parseFloat(r.gst),
                    })),
            };

            const res  = await fetch(API_URL, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Server error');
            }

            const data = await res.json();
            setResults(data);
            setStep(2);
        } catch (e) {
            setError(e.message || 'Could not connect to backend. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { setRows([emptyRow()]); setResults(null); setStep(1); setError(''); };

    // ─── STEP 1: FORM ──────────────────────────────────────────────────────────
    if (step === 1) return (
        <div className="p-4 md:p-6 space-y-5 min-h-screen">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Smart Quote Request</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Enter your product requirements — our ML model will predict the best vendor prices
                </p>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <AlertCircle size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-700">
                    Fill in <strong>Item Description</strong>, <strong>Quantity</strong>, and <strong>Target Price</strong>.
                    The ML model will automatically predict <strong>Vendor A/B/C prices</strong>,
                    <strong> Lead Time</strong>, and <strong>Warranty</strong> for each vendor.
                </p>
            </div>

            {/* Form Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ minWidth: '900px' }}>
                        <thead>
                            <tr className="bg-[#1a3557] text-white text-[11px] font-semibold">
                                <th className="px-2 py-3 text-center border-r border-blue-700/40 w-8">#</th>
                                <th className="px-3 py-3 text-left border-r border-blue-700/40">
                                    Item Description <span className="text-red-300">*</span>
                                </th>
                                <th className="px-3 py-3 text-left border-r border-blue-700/40 w-32">Preferred Brand</th>
                                <th className="px-3 py-3 text-left border-r border-blue-700/40 w-40">Specifications / Details</th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-16">Unit</th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-20">
                                    Qty Reqd. <span className="text-red-300">*</span>
                                </th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-28">
                                    Target Price / Unit (₹) <span className="text-red-300">*</span>
                                </th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-16">GST %</th>
                                <th className="px-3 py-3 text-center w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-2 py-2 text-center text-gray-400 font-semibold border-r border-gray-100">
                                        {idx + 1}
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TInput value={row.description} onChange={v => updateRow(row.id, 'description', v)} placeholder="e.g. UPS, Fan, Laptop..." />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TInput value={row.brand} onChange={v => updateRow(row.id, 'brand', v)} placeholder="e.g. HP, Havells" />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TInput value={row.specs} onChange={v => updateRow(row.id, 'specs', v)} placeholder="e.g. 1KVA, 1200mm" />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TSelect value={row.unit} onChange={v => updateRow(row.id, 'unit', v)} options={UNITS} />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TInput type="number" value={row.qty} onChange={v => updateRow(row.id, 'qty', v)} placeholder="0" className="text-center" />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TInput type="number" value={row.target_price} onChange={v => updateRow(row.id, 'target_price', v)} placeholder="0.00" className="text-center" />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TSelect value={row.gst} onChange={v => updateRow(row.id, 'gst', Number(v))} options={GST_RATES} />
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button onClick={() => deleteRow(row.id)} className="text-gray-200 hover:text-red-400 transition">
                                            <Trash2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Row */}
                <div className="border-t border-gray-100 px-4 py-3">
                    <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 font-semibold transition">
                        <Plus size={15} /> Add Item
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
                <button
                    onClick={fetchPredictions}
                    disabled={!canSubmit || loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3.5
                               rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200
                               disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                    {loading ? (
                        <><Loader2 size={17} className="animate-spin" /> Getting ML Predictions…</>
                    ) : (
                        <>Get Best Vendor <ChevronRight size={18} /></>
                    )}
                </button>
            </div>
        </div>
    );

    // ─── STEP 2: RESULTS ───────────────────────────────────────────────────────
    if (!results) return null;

    const { items, overall_ranking } = results;
    const winner      = overall_ranking[0]?.vendor;
    const winnerIdx   = ['Vendor A', 'Vendor B', 'Vendor C'].indexOf(winner);
    const winnerStyle = VSTYLE[winnerIdx] || VSTYLE[0];

    return (
        <div className="p-4 md:p-6 space-y-6 min-h-screen">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quote Results</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {items.length} items • ML-predicted vendor prices & rankings
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setStep(1)}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition">
                        <Pencil size={13} /> Edit Items
                    </button>
                    <button onClick={reset}
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition">
                        <RotateCcw size={13} /> New Request
                    </button>
                </div>
            </div>

            {/* Overall Winner Banner */}
            <div className={`${winnerStyle.bg} border ${winnerStyle.border} rounded-2xl p-5
                             flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${winnerStyle.badge}`}>
                        <Trophy size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                            Best Overall Vendor (Lowest Total Cost)
                        </p>
                        <p className={`text-2xl font-extrabold ${winnerStyle.text}`}>{winner}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Total Cost:{' '}
                            <span className={`font-bold ${winnerStyle.text}`}>
                                {fmt(overall_ranking[0]?.total_cost)}
                            </span>{' '}
                            (incl. GST)
                        </p>
                    </div>
                </div>

                {/* Cost comparison pills */}
                <div className="flex flex-wrap gap-3">
                    {overall_ranking.map((v, i) => {
                        const vIdx = ['Vendor A', 'Vendor B', 'Vendor C'].indexOf(v.vendor);
                        const s    = VSTYLE[vIdx] || VSTYLE[0];
                        return (
                            <div key={v.vendor} className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white border-gray-200">
                                <Medal size={14} className={MEDAL_COLORS[i]} />
                                <span className="text-xs text-gray-500">{v.vendor}</span>
                                <span className={`text-sm font-extrabold ${s.text}`}>{fmt(v.total_cost)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Per-item Results */}
            {items.map((item, itemIdx) => {
                const vendors = item.vendors; // sorted by price (cheapest first)
                return (
                    <div key={itemIdx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Item header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-gray-800 text-base">
                                    {itemIdx + 1}. {item.description}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-1">
                                    {item.brand && <span className="text-xs text-gray-400">Brand: {item.brand}</span>}
                                    {item.specs && <span className="text-xs text-gray-400">Specs: {item.specs}</span>}
                                    <span className="text-xs text-gray-400">Qty: {item.qty} {item.unit}</span>
                                    <span className="text-xs text-gray-400">Target: {fmt(item.target_price)}/unit</span>
                                    <span className="text-xs text-gray-400">GST: {item.gst}%</span>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-full
                                ${VSTYLE[['Vendor A','Vendor B','Vendor C'].indexOf(item.best_vendor)]?.badge || 'bg-gray-100 text-gray-600'}`}>
                                Best: {item.best_vendor}
                            </span>
                        </div>

                        {/* Vendor comparison table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs" style={{ minWidth: '780px' }}>
                                <thead>
                                    <tr className="bg-[#1a3557] text-white text-[11px] font-semibold">
                                        <th className="px-4 py-2.5 text-left border-r border-blue-700/40">Vendor</th>
                                        <th className="px-4 py-2.5 text-center border-r border-blue-700/40">Quoted Price / Unit (₹)</th>
                                        <th className="px-4 py-2.5 text-center border-r border-blue-700/40">Variance (₹)</th>
                                        <th className="px-4 py-2.5 text-center border-r border-blue-700/40">Total Amount (₹) <span className="font-normal opacity-70">incl. GST</span></th>
                                        <th className="px-4 py-2.5 text-center border-r border-blue-700/40">Lead Time (Days)</th>
                                        <th className="px-4 py-2.5 text-center border-r border-blue-700/40">Warranty Period</th>
                                        <th className="px-4 py-2.5 text-center">Rank</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vendors.map((v) => {
                                        const vIdx    = ['Vendor A', 'Vendor B', 'Vendor C'].indexOf(v.vendor);
                                        const s       = VSTYLE[vIdx] || VSTYLE[0];
                                        const isBest  = v.item_rank === 1;
                                        const medalCl = MEDAL_COLORS[v.item_rank - 1] || 'text-gray-300';
                                        return (
                                            <tr key={v.vendor} className={`transition-colors ${isBest ? s.bg : 'hover:bg-gray-50/50'}`}>

                                                {/* Vendor Name */}
                                                <td className={`px-4 py-3 border-r border-gray-100`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                                                        <span className={`font-bold text-sm ${isBest ? s.text : 'text-gray-700'}`}>
                                                            {v.vendor}
                                                        </span>
                                                        {isBest && (
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.badge}`}>
                                                                CHEAPEST
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Quoted Price */}
                                                <td className={`px-4 py-3 text-center border-r border-gray-100 ${isBest ? s.bg : ''}`}>
                                                    <span className={`font-extrabold text-base ${isBest ? s.text : 'text-gray-600'}`}>
                                                        {fmt(v.predicted_price)}
                                                    </span>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">ML predicted</p>
                                                </td>

                                                {/* Variance */}
                                                <td className={`px-4 py-3 text-center border-r border-gray-100 ${isBest ? s.bg : ''}`}>
                                                    <span className={`font-semibold ${v.variance < 0 ? 'text-green-600' : v.variance > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {v.variance > 0 ? '+' : ''}{fmt(v.variance)}
                                                    </span>
                                                    <p className={`text-[10px] mt-0.5 ${v.variance < 0 ? 'text-green-500' : v.variance > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                                        {v.variance < 0 ? 'Below target' : v.variance > 0 ? 'Above target' : 'On target'}
                                                    </p>
                                                </td>

                                                {/* Total */}
                                                <td className={`px-4 py-3 text-center border-r border-gray-100 ${isBest ? s.bg : ''}`}>
                                                    <span className={`font-bold ${isBest ? s.text : 'text-gray-600'}`}>
                                                        {fmt(v.total_incl_gst)}
                                                    </span>
                                                </td>

                                                {/* Lead Time */}
                                                <td className={`px-4 py-3 text-center border-r border-gray-100 ${isBest ? s.bg : ''}`}>
                                                    <span className="font-semibold text-gray-700">{v.lead_time_days} days</span>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {v.lead_time_days <= 5 ? '⚡ Fast' : v.lead_time_days >= 10 ? 'Slower' : 'Standard'}
                                                    </p>
                                                </td>

                                                {/* Warranty */}
                                                <td className={`px-4 py-3 text-center border-r border-gray-100 ${isBest ? s.bg : ''}`}>
                                                    <span className="font-semibold text-gray-700">{v.warranty}</span>
                                                </td>

                                                {/* Rank */}
                                                <td className={`px-4 py-3 text-center ${isBest ? s.bg : ''}`}>
                                                    <Medal size={18} className={`mx-auto ${medalCl}`} />
                                                    <p className="text-[10px] text-gray-400 mt-0.5">Rank {v.item_rank}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
