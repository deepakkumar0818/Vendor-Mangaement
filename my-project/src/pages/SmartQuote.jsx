import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Trash2, Trophy, Package, Search, ChevronRight, RotateCcw } from 'lucide-react';

// ── Vendor price catalog (from sample dataset) ────────────────────────────────
const CATALOG = [
    { id: 1,  name: 'UPS (Uninterruptible Power Supply)', unit: 'Nos', gst: 18, prices: { 'Vendor A': 19000, 'Vendor B': 18500, 'Vendor C': 19500 } },
    { id: 2,  name: 'Extension Board / Power Strip',       unit: 'Nos', gst: 18, prices: { 'Vendor A': 850,   'Vendor B': 820,   'Vendor C': 900   } },
    { id: 3,  name: 'Electric Kettle',                     unit: 'Nos', gst: 18, prices: { 'Vendor A': 1200,  'Vendor B': 1180,  'Vendor C': 1300  } },
    { id: 4,  name: 'LED Desk Lamp',                       unit: 'Nos', gst: 18, prices: { 'Vendor A': 800,   'Vendor B': 780,   'Vendor C': 820   } },
    { id: 5,  name: 'Air Purifier',                        unit: 'Nos', gst: 18, prices: { 'Vendor A': 13000, 'Vendor B': 12800, 'Vendor C': 13200 } },
    { id: 6,  name: 'Electric Room Heater',                unit: 'Nos', gst: 18, prices: { 'Vendor A': 3000,  'Vendor B': 2900,  'Vendor C': 3100  } },
    { id: 7,  name: 'Ceiling Fan (Office Grade)',          unit: 'Nos', gst: 18, prices: { 'Vendor A': 4000,  'Vendor B': 3800,  'Vendor C': 4200  } },
    { id: 8,  name: 'Electric Paper Shredder',             unit: 'Nos', gst: 18, prices: { 'Vendor A': 8000,  'Vendor B': 7800,  'Vendor C': 8200  } },
    { id: 9,  name: 'Smart Power Socket / Timer',          unit: 'Nos', gst: 18, prices: { 'Vendor A': 1000,  'Vendor B': 980,   'Vendor C': 1050  } },
    { id: 10, name: 'Electric Water Dispenser',            unit: 'Nos', gst: 18, prices: { 'Vendor A': 16000, 'Vendor B': 15500, 'Vendor C': 16500 } },
];

const VENDORS = ['Vendor A', 'Vendor B', 'Vendor C'];

const VENDOR_STYLE = {
    'Vendor A': { dot: 'bg-indigo-500',  text: 'text-indigo-600',  cell: 'bg-indigo-50',  badge: 'bg-indigo-100 text-indigo-700'  },
    'Vendor B': { dot: 'bg-violet-500',  text: 'text-violet-600',  cell: 'bg-violet-50',  badge: 'bg-violet-100 text-violet-700'  },
    'Vendor C': { dot: 'bg-emerald-500', text: 'text-emerald-600', cell: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
};

const fmt = n => '₹' + new Intl.NumberFormat('en-IN').format(n);

export default function SmartQuote() {
    const [step,     setStep]     = useState(1); // 1 = select products, 2 = results
    const [cart,     setCart]     = useState([]);     // [{ catalogId, qty }]
    const [search,   setSearch]   = useState('');
    const [showDrop, setShowDrop] = useState(false);

    // ── Filtered catalog for search dropdown ─────────────────────────────────
    const filtered = useMemo(() =>
        CATALOG.filter(p =>
            !cart.find(c => c.catalogId === p.id) &&
            p.name.toLowerCase().includes(search.toLowerCase())
        ), [search, cart]);

    // ── Add product to cart ───────────────────────────────────────────────────
    const addToCart = (product) => {
        setCart(c => [...c, { catalogId: product.id, qty: 1 }]);
        setSearch('');
        setShowDrop(false);
    };

    const removeFromCart = (catalogId) =>
        setCart(c => c.filter(x => x.catalogId !== catalogId));

    const updateQty = (catalogId, qty) =>
        setCart(c => c.map(x => x.catalogId === catalogId ? { ...x, qty: Math.max(1, qty) } : x));

    // ── Results calculation ───────────────────────────────────────────────────
    const results = useMemo(() => {
        if (cart.length === 0) return null;

        const winCount = Object.fromEntries(VENDORS.map(v => [v, 0]));
        const totalCost = Object.fromEntries(VENDORS.map(v => [v, 0]));

        const rows = cart.map(({ catalogId, qty }) => {
            const product  = CATALOG.find(p => p.id === catalogId);
            const minPrice = Math.min(...VENDORS.map(v => product.prices[v]));
            const cheapest = VENDORS.find(v => product.prices[v] === minPrice);

            winCount[cheapest]++;
            VENDORS.forEach(v => {
                totalCost[v] += product.prices[v] * qty;
            });

            return { product, qty, minPrice, cheapest };
        });

        const overallWinner = VENDORS.reduce((a, b) => winCount[a] >= winCount[b] ? a : b);

        return { rows, winCount, totalCost, overallWinner };
    }, [cart]);

    const reset = () => { setCart([]); setStep(1); setSearch(''); };

    // ── STEP 1: Product selection ─────────────────────────────────────────────
    if (step === 1) return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Customer Quote Request</h1>
                    <p className="text-sm text-gray-400">Jo products chahiye vo add karo — hum best vendor dhundh denge</p>
                </div>
            </div>

            {/* Search box */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Package size={16} className="text-indigo-500" /> Add Products
                </h2>

                {/* Search / dropdown */}
                <div className="relative">
                    <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-400 bg-gray-50">
                        <Search size={16} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search products... (e.g. Fan, UPS, Kettle)"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
                            onFocus={() => setShowDrop(true)}
                            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                        />
                    </div>

                    {showDrop && (search || true) && filtered.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                            {filtered.slice(0, 6).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{p.name}</p>
                                        <p className="text-xs text-gray-400">
                                            Min price: {fmt(Math.min(...Object.values(p.prices)))} / {p.unit}
                                        </p>
                                    </div>
                                    <Plus size={16} className="text-indigo-400 shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Close dropdown on outside click */}
                {showDrop && (
                    <div className="fixed inset-0 z-10" onClick={() => setShowDrop(false)} />
                )}

                {/* Cart items */}
                {cart.length > 0 ? (
                    <div className="space-y-3 mt-2">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Selected Products ({cart.length})</p>
                        {cart.map(({ catalogId, qty }) => {
                            const product = CATALOG.find(p => p.id === catalogId);
                            const minP    = Math.min(...Object.values(product.prices));
                            return (
                                <div key={catalogId} className="flex items-center gap-3 bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                        <p className="text-xs text-gray-400">From {fmt(minP)} / {product.unit} • GST {product.gst}%</p>
                                    </div>

                                    {/* Qty stepper */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => updateQty(catalogId, qty - 1)}
                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold flex items-center justify-center hover:bg-gray-50"
                                        >−</button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-700">{qty}</span>
                                        <button
                                            onClick={() => updateQty(catalogId, qty + 1)}
                                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold flex items-center justify-center hover:bg-gray-50"
                                        >+</button>
                                    </div>

                                    <button onClick={() => removeFromCart(catalogId)}
                                        className="text-gray-300 hover:text-rose-400 transition shrink-0">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-10 text-center text-gray-300">
                        <Package size={40} className="mx-auto mb-2" />
                        <p className="text-sm">Koi product nahi add kiya abhi</p>
                    </div>
                )}
            </div>

            {/* Next button */}
            <button
                onClick={() => setStep(2)}
                disabled={cart.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
                Search Best Vendor<ChevronRight size={18} />
            </button>
        </div>
    );

    // ── STEP 2: Results ───────────────────────────────────────────────────────
    const { rows, winCount, totalCost, overallWinner } = results;
    const winnerStyle = VENDOR_STYLE[overallWinner];

    return (
        <div className="p-6 max-w-full mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quote Results</h1>
                        <p className="text-sm text-gray-400">{rows.length} products • sabse sasta vendor neeche dikhega</p>
                    </div>
                </div>
                <button onClick={reset}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition">
                    <RotateCcw size={14} /> Naya Request
                </button>
            </div>

            {/* Overall Winner Banner */}
            <div className={`${winnerStyle.cell} border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${winnerStyle.badge}`}>
                        <Trophy size={28} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Sabse Sasta Overall Vendor</p>
                        <p className={`text-2xl font-extrabold ${winnerStyle.text}`}>{overallWinner}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {winCount[overallWinner]} / {rows.length} items mein cheapest •{' '}
                            Total: <span className={`font-bold ${winnerStyle.text}`}>{fmt(totalCost[overallWinner])}</span> + GST
                        </p>
                    </div>
                </div>

                {/* Vendor win count pills */}
                <div className="flex flex-wrap gap-3">
                    {VENDORS.map(v => {
                        const s = VENDOR_STYLE[v];
                        return (
                            <div key={v} className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-white border-gray-200`}>
                                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                <span className="text-xs font-semibold text-gray-600">{v}</span>
                                <span className={`text-lg font-extrabold ${s.text}`}>{winCount[v]}</span>
                                <span className="text-xs text-gray-400">wins</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Per-item results table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700">Item-wise Best Vendor</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm" style={{ minWidth: '700px' }}>
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</th>
                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Qty</th>
                                {VENDORS.map(v => (
                                    <th key={v} className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide ${VENDOR_STYLE[v].text}`}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${VENDOR_STYLE[v].dot}`} />
                                            {v}
                                        </div>
                                        <span className="text-gray-300 font-normal normal-case">per unit</span>
                                    </th>
                                ))}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">Best Vendor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rows.map(({ product, qty, minPrice, cheapest }) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">GST {product.gst}% included</p>
                                    </td>
                                    <td className="px-3 py-4 text-center font-semibold text-gray-600">{qty} {product.unit}</td>

                                    {VENDORS.map(v => {
                                        const price   = product.prices[v];
                                        const isMin   = price === minPrice;
                                        const s       = VENDOR_STYLE[v];
                                        return (
                                            <td key={v} className={`px-4 py-4 text-center ${isMin ? s.cell : ''}`}>
                                                <p className={`font-bold text-base ${isMin ? s.text : 'text-gray-500'}`}>
                                                    {fmt(price)}
                                                </p>
                                                <p className="text-xs text-gray-400">Total: {fmt(price * qty)}</p>
                                                {isMin && (
                                                    <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>
                                                        CHEAPEST
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}

                                    <td className="px-4 py-4 text-center">
                                        <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${VENDOR_STYLE[cheapest].badge}`}>
                                            {cheapest}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Total cost footer */}
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex flex-wrap gap-4 items-center">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Total Order Cost (excl. GST):</span>
                        {VENDORS.map(v => {
                            const s       = VENDOR_STYLE[v];
                            const isWinner = v === overallWinner;
                            return (
                                <div key={v} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${isWinner ? s.cell + ' border border-gray-200' : ''}`}>
                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                    <span className="text-xs text-gray-500">{v}:</span>
                                    <span className={`text-sm font-extrabold ${s.text}`}>{fmt(totalCost[v])}</span>
                                    {isWinner && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${s.badge}`}>BEST</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
