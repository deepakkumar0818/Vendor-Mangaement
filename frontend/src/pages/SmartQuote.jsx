import { useState } from 'react';
import {
    Plus, Trash2, Trophy, ChevronRight, RotateCcw,
    Pencil, Loader2, AlertCircle, Medal, PackageX
} from 'lucide-react';

const UNITS     = ['Nos', 'Kg', 'Ltrs', 'Pcs', 'Box', 'Set', 'Mtr', 'Sqft'];
const GST_RATES = [0, 5, 12, 18, 28];
const API_URL   = 'http://localhost:8000/api/smart-quote';

const COLORS = [
    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  header: 'bg-indigo-600',  badge: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500',  border: 'border-indigo-200'  },
    { bg: 'bg-violet-50',  text: 'text-violet-700',  header: 'bg-violet-600',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500',  border: 'border-violet-200'  },
    { bg: 'bg-emerald-50', text: 'text-emerald-700', header: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
    { bg: 'bg-amber-50',   text: 'text-amber-700',   header: 'bg-amber-600',   badge: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500',   border: 'border-amber-200'   },
    { bg: 'bg-rose-50',    text: 'text-rose-700',    header: 'bg-rose-600',    badge: 'bg-rose-100 text-rose-700',    dot: 'bg-rose-500',    border: 'border-rose-200'    },
];
const MEDAL = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
const fmt   = n => n != null ? '₹' + new Intl.NumberFormat('en-IN').format(Number(n).toFixed(2)) : '—';
const uid   = () => Math.random().toString(36).slice(2);
const vColor = (name, all) => COLORS[all.indexOf(name) % COLORS.length] || COLORS[0];

const emptyRow = () => ({
    id: uid(), item_description: '', preferred_brand: '',
    specs: '', unit: 'Nos', qty: '', target_price: '', gst_percent: 18,
});

// Shared small table input components
const TInput = ({ value, onChange, placeholder, type = 'text', className = '' }) => (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full bg-transparent text-xs text-gray-700 placeholder-gray-300 outline-none focus:bg-blue-50 rounded px-1.5 py-1 ${className}`} />
);
const TSelect = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent text-xs text-gray-700 outline-none focus:bg-blue-50 rounded px-1.5 py-1 cursor-pointer">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
);

export default function SmartQuote() {
    const [rows,    setRows]    = useState([emptyRow()]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');
    const [step,    setStep]    = useState(1);

    const updateRow = (id, field, val) =>
        setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: val } : r));
    const addRow    = () => setRows(rs => [...rs, emptyRow()]);
    const deleteRow = id => setRows(rs => rs.length > 1 ? rs.filter(r => r.id !== id) : rs);
    const canSubmit = rows.some(r => r.item_description.trim() && r.qty);

    const fetchQuotes = async () => {
        setError('');
        setLoading(true);
        try {
            const payload = {
                items: rows
                    .filter(r => r.item_description.trim() && r.qty)
                    .map(r => ({
                        item_description: r.item_description,
                        preferred_brand:  r.preferred_brand,
                        specs:            r.specs,
                        unit:             r.unit,
                        qty:              parseFloat(r.qty),
                        target_price:     r.target_price ? parseFloat(r.target_price) : null,
                        gst_percent:      r.gst_percent  ? parseFloat(r.gst_percent)  : null,
                    })),
            };
            const res = await fetch(API_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Server error'); }
            setResults(await res.json());
            setStep(2);
        } catch (e) {
            setError(e.message || 'Could not connect to backend. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { setRows([emptyRow()]); setResults(null); setStep(1); setError(''); };

    // ── STEP 1 — Customer Request Form ────────────────────────────────────────
    if (step === 1) return (
        <div className="p-4 md:p-6 space-y-5">

            <div>
                <h1 className="text-2xl font-bold text-gray-800">Smart Quote Finder</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Enter the products you need — vendor prices, lead times & warranty are fetched automatically
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ minWidth: '900px' }}>
                        <thead>
                            <tr className="bg-[#1a3557] text-white text-[11px] font-semibold">
                                <th className="px-2 py-3 text-center border-r border-blue-700/40 w-8">S. No.</th>
                                <th className="px-3 py-3 text-left border-r border-blue-700/40">
                                    Item Description <span className="text-red-300">*</span>
                                </th>
                                <th className="px-3 py-3 text-left border-r border-blue-700/40 w-28">Preferred Brand</th>
                                <th className="px-3 py-3 text-left border-r border-blue-700/40 w-40">Specifications / Details</th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-16">Unit</th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-20">
                                    Qty Reqd. <span className="text-red-300">*</span>
                                </th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-28">
                                    Target Price / Unit (₹)
                                </th>
                                <th className="px-3 py-3 text-center border-r border-blue-700/40 w-16">GST %</th>
                                <th className="px-2 py-3 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row, idx) => (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-2 py-2 text-center text-gray-400 font-semibold border-r border-gray-100">{idx + 1}</td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TInput value={row.item_description} onChange={v => updateRow(row.id, 'item_description', v)} placeholder="e.g. UPS, Ceiling Fan..." />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TInput value={row.preferred_brand} onChange={v => updateRow(row.id, 'preferred_brand', v)} placeholder="e.g. APC, Havells" />
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
                                        <TInput type="number" value={row.target_price} onChange={v => updateRow(row.id, 'target_price', v)} placeholder="Optional" className="text-center" />
                                    </td>
                                    <td className="px-2 py-2 border-r border-gray-100">
                                        <TSelect value={row.gst_percent} onChange={v => updateRow(row.id, 'gst_percent', Number(v))} options={GST_RATES} />
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
                <div className="border-t border-gray-100 px-4 py-3">
                    <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 font-semibold transition">
                        <Plus size={15} /> Add Item
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700">{error}</p>
                </div>
            )}

            <div className="flex justify-end">
                <button onClick={fetchQuotes} disabled={!canSubmit || loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3.5 rounded-2xl
                               hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                    {loading
                        ? <><Loader2 size={17} className="animate-spin" /> Fetching Quotes…</>
                        : <>Find Best Vendor <ChevronRight size={18} /></>
                    }
                </button>
            </div>
        </div>
    );

    // ── STEP 2 — Results ──────────────────────────────────────────────────────
    if (!results) return null;
    const { items, overall_ranking } = results;
    const allVendors = [...new Set(items.flatMap(i => i.quotes.map(q => q.vendor_name)))];
    const winner     = overall_ranking[0]?.vendor_name;
    const winC       = vColor(winner, allVendors);

    return (
        <div className="p-4 md:p-6 space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quote Results</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{items.length} item(s) • live prices from registered vendors</p>
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

            {/* Overall Winner */}
            {overall_ranking.length > 0 && (
                <div className={`${winC.bg} border ${winC.border} rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${winC.badge}`}><Trophy size={28} /></div>
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Best Overall Vendor — Lowest Total Cost</p>
                            <p className={`text-2xl font-extrabold ${winC.text}`}>{winner}</p>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Total: <span className={`font-bold ${winC.text}`}>{fmt(overall_ranking[0].total_cost)}</span> (incl. GST)
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {overall_ranking.map((v, i) => {
                            const c = vColor(v.vendor_name, allVendors);
                            return (
                                <div key={v.vendor_name} className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white border-gray-200">
                                    <Medal size={14} className={MEDAL[i] || 'text-gray-300'} />
                                    <span className="text-xs text-gray-500">{v.vendor_name}</span>
                                    <span className={`text-sm font-extrabold ${c.text}`}>{fmt(v.total_cost)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Per-item results */}
            {items.map((item, idx) => {
                const hasQ = item.quotes.length > 0;
                return (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Item header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-gray-800 text-base">{idx + 1}. {item.item_description}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    {item.preferred_brand && <span className="text-xs text-gray-400">Brand: {item.preferred_brand}</span>}
                                    {item.specs           && <span className="text-xs text-gray-400">Specs: {item.specs}</span>}
                                    <span className="text-xs text-gray-400">Qty: {item.qty} {item.unit}</span>
                                    {item.target_price    && <span className="text-xs text-gray-400">Target: {fmt(item.target_price)}/unit</span>}
                                </div>
                            </div>
                            {hasQ
                                ? <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${vColor(item.best_vendor, allVendors).badge}`}>Best: {item.best_vendor}</span>
                                : <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-500">No vendors found</span>
                            }
                        </div>

                        {!hasQ && (
                            <div className="px-5 py-10 text-center">
                                <PackageX size={36} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-400">{item.note || 'No vendor has listed this product yet.'}</p>
                                <p className="text-xs text-gray-300 mt-1">Ask vendors to register via Vendor Portal and add this product.</p>
                            </div>
                        )}

                        {/* Results table — same columns as the header screenshot */}
                        {hasQ && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs" style={{ minWidth: '900px' }}>
                                    <thead>
                                        <tr className="bg-[#1a3557] text-white text-[11px] font-semibold">
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40 w-8">S. No.</th>
                                            <th className="px-3 py-2.5 text-left   border-r border-blue-700/40">Vendor Name</th>
                                            <th className="px-3 py-2.5 text-left   border-r border-blue-700/40">Brand</th>
                                            <th className="px-3 py-2.5 text-left   border-r border-blue-700/40">Specifications / Details</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40 w-14">Unit</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40 w-14">Qty Reqd.</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40">Target Price / Unit (₹)</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40">Vendor Quoted Price / Unit (₹)</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40">Variance (₹)</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40">GST %</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40">Total Amount (₹)</th>
                                            <th className="px-3 py-2.5 text-center border-r border-blue-700/40">Lead Time (Days)</th>
                                            <th className="px-3 py-2.5 text-center">Warranty Period</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {item.quotes.map((q, qi) => {
                                            const isBest = q.rank === 1;
                                            const c      = vColor(q.vendor_name, allVendors);
                                            const varNeg = q.variance != null && q.variance < 0;
                                            const varPos = q.variance != null && q.variance > 0;
                                            return (
                                                <tr key={qi} className={`transition-colors ${isBest ? c.bg : 'hover:bg-gray-50/50'}`}>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 ${isBest ? c.bg : ''}`}>
                                                        <Medal size={16} className={`mx-auto ${MEDAL[q.rank - 1] || 'text-gray-300'}`} />
                                                    </td>
                                                    <td className={`px-3 py-3 border-r border-gray-100 ${isBest ? c.bg : ''}`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                                                            <span className={`font-bold ${isBest ? c.text : 'text-gray-700'}`}>{q.vendor_name}</span>
                                                        </div>
                                                        {isBest && <span className={`mt-0.5 inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.badge}`}>BEST PRICE</span>}
                                                    </td>
                                                    <td className={`px-3 py-3 border-r border-gray-100 text-gray-600 ${isBest ? c.bg : ''}`}>{q.brand || '—'}</td>
                                                    <td className={`px-3 py-3 border-r border-gray-100 text-gray-500 italic ${isBest ? c.bg : ''}`}>{q.specs || '—'}</td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 text-gray-600 ${isBest ? c.bg : ''}`}>{q.unit}</td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 font-semibold text-gray-700 ${isBest ? c.bg : ''}`}>{item.qty}</td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 text-gray-500 ${isBest ? c.bg : ''}`}>{fmt(item.target_price)}</td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 ${isBest ? c.bg : ''}`}>
                                                        <span className={`font-extrabold text-sm ${isBest ? c.text : 'text-gray-700'}`}>{fmt(q.price_per_unit)}</span>
                                                    </td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 ${isBest ? c.bg : ''}`}>
                                                        {q.variance != null
                                                            ? <span className={`font-semibold ${varNeg ? 'text-green-600' : varPos ? 'text-red-500' : 'text-gray-400'}`}>
                                                                {varPos ? '+' : ''}{fmt(q.variance)}
                                                              </span>
                                                            : <span className="text-gray-300">—</span>
                                                        }
                                                    </td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 text-gray-600 ${isBest ? c.bg : ''}`}>{q.gst_percent}%</td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 ${isBest ? c.bg : ''}`}>
                                                        <span className={`font-bold ${isBest ? c.text : 'text-gray-700'}`}>{fmt(q.total_incl_gst)}</span>
                                                        <p className="text-[9px] text-gray-400 mt-0.5">incl. GST</p>
                                                    </td>
                                                    <td className={`px-3 py-3 text-center border-r border-gray-100 font-semibold text-gray-700 ${isBest ? c.bg : ''}`}>
                                                        {q.lead_time_days ? `${q.lead_time_days} days` : '—'}
                                                    </td>
                                                    <td className={`px-3 py-3 text-center text-gray-700 ${isBest ? c.bg : ''}`}>{q.warranty || '—'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
