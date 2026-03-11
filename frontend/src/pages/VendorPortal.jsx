import { useState } from 'react';
import { Plus, Trash2, Send, CheckCircle, AlertCircle, Loader2, Store } from 'lucide-react';

const UNITS     = ['Nos', 'Kg', 'Ltrs', 'Pcs', 'Box', 'Set', 'Mtr', 'Sqft'];
const GST_RATES = [0, 5, 12, 18, 28];
const API_URL   = 'http://localhost:8000/api/vendor/catalog';

const uid      = () => Math.random().toString(36).slice(2);
const emptyProduct = () => ({
    id: uid(), item_description: '', brand: '', specs: '',
    unit: 'Nos', price_per_unit: '', gst_percent: 18,
    lead_time_days: '', warranty: '1 Year', stock_qty: '',
});

const Input = ({ label, value, onChange, placeholder, type = 'text', required = false }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700
                       placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
        />
    </div>
);

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
        className="w-full bg-transparent text-xs text-gray-700 outline-none focus:bg-blue-50 rounded px-1.5 py-1 cursor-pointer"
    >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
);

export default function VendorPortal() {
    const [info, setInfo] = useState({ vendor_name: '', contact_person: '', email: '', phone: '' });
    const [products, setProducts] = useState([emptyProduct()]);
    const [loading,  setLoading]  = useState(false);
    const [success,  setSuccess]  = useState(null);
    const [error,    setError]    = useState('');

    const updateInfo    = (field, val) => setInfo(i => ({ ...i, [field]: val }));
    const updateProduct = (id, field, val) =>
        setProducts(ps => ps.map(p => p.id === id ? { ...p, [field]: val } : p));
    const addProduct    = () => setProducts(ps => [...ps, emptyProduct()]);
    const deleteProduct = id => setProducts(ps => ps.length > 1 ? ps.filter(p => p.id !== id) : ps);

    const canSubmit = info.vendor_name.trim() && products.some(p => p.item_description.trim() && p.price_per_unit);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            const payload = {
                ...info,
                products: products
                    .filter(p => p.item_description.trim() && p.price_per_unit)
                    .map(({ id, ...rest }) => ({
                        ...rest,
                        price_per_unit:  parseFloat(rest.price_per_unit),
                        gst_percent:     parseFloat(rest.gst_percent),
                        lead_time_days:  rest.lead_time_days ? parseInt(rest.lead_time_days) : 7,
                        stock_qty:       rest.stock_qty ? parseInt(rest.stock_qty) : null,
                    })),
            };

            const res = await fetch(API_URL, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Server error');
            }

            const data = await res.json();
            setSuccess({ vendorId: data.vendor_id, vendorName: info.vendor_name });
            setInfo({ vendor_name: '', contact_person: '', email: '', phone: '' });
            setProducts([emptyProduct()]);
        } catch (e) {
            setError(e.message || 'Could not connect to backend. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-indigo-600 shrink-0" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vendor Portal</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Submit your product catalog — customers will see your prices when requesting quotes
                    </p>
                </div>
            </div>

            {/* Success Banner */}
            {success && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                    <CheckCircle size={20} className="text-green-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-green-800">Catalog submitted successfully!</p>
                        <p className="text-sm text-green-700 mt-0.5">
                            <strong>{success.vendorName}</strong> (ID: {success.vendorId}) — your products are now visible to customers.
                        </p>
                        <button
                            onClick={() => setSuccess(null)}
                            className="mt-2 text-xs text-green-600 underline hover:text-green-800"
                        >
                            Submit another catalog
                        </button>
                    </div>
                </div>
            )}

            {!success && (
                <>
                    {/* Company Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h2 className="font-bold text-gray-700 text-base">Company Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Company / Vendor Name" value={info.vendor_name}
                                onChange={v => updateInfo('vendor_name', v)}
                                placeholder="e.g. ABC Electronics Pvt. Ltd." required />
                            <Input label="Contact Person" value={info.contact_person}
                                onChange={v => updateInfo('contact_person', v)}
                                placeholder="e.g. Rajesh Kumar" />
                            <Input label="Email Address" value={info.email} type="email"
                                onChange={v => updateInfo('email', v)}
                                placeholder="e.g. sales@abcelectronics.com" />
                            <Input label="Phone Number" value={info.phone}
                                onChange={v => updateInfo('phone', v)}
                                placeholder="e.g. 9876543210" />
                        </div>
                    </div>

                    {/* Product Catalog */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h2 className="font-bold text-gray-700 text-base">Product Catalog</h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Add all products you supply with your best prices
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs" style={{ minWidth: '1000px' }}>
                                <thead>
                                    <tr className="bg-[#1a3557] text-white text-[11px] font-semibold">
                                        <th className="px-2 py-3 text-center border-r border-blue-700/40 w-8">#</th>
                                        <th className="px-3 py-3 text-left border-r border-blue-700/40">
                                            Item Description <span className="text-red-300">*</span>
                                        </th>
                                        <th className="px-3 py-3 text-left border-r border-blue-700/40 w-28">Brand</th>
                                        <th className="px-3 py-3 text-left border-r border-blue-700/40 w-36">Specifications</th>
                                        <th className="px-3 py-3 text-center border-r border-blue-700/40 w-16">Unit</th>
                                        <th className="px-3 py-3 text-center border-r border-blue-700/40 w-28">
                                            Price / Unit (₹) <span className="text-red-300">*</span>
                                        </th>
                                        <th className="px-3 py-3 text-center border-r border-blue-700/40 w-16">GST %</th>
                                        <th className="px-3 py-3 text-center border-r border-blue-700/40 w-24">Lead Time (Days)</th>
                                        <th className="px-3 py-3 text-center border-r border-blue-700/40 w-24">Warranty Period</th>
                                        <th className="px-3 py-3 text-center border-r border-blue-700/40 w-20">Stock Qty</th>
                                        <th className="px-3 py-3 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-2 py-2 text-center text-gray-400 font-semibold border-r border-gray-100">{idx + 1}</td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TInput value={p.item_description} onChange={v => updateProduct(p.id, 'item_description', v)} placeholder="e.g. UPS, LED Fan..." />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TInput value={p.brand} onChange={v => updateProduct(p.id, 'brand', v)} placeholder="e.g. APC, Havells" />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TInput value={p.specs} onChange={v => updateProduct(p.id, 'specs', v)} placeholder="e.g. 1KVA, 1200mm" />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TSelect value={p.unit} onChange={v => updateProduct(p.id, 'unit', v)} options={UNITS} />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TInput type="number" value={p.price_per_unit} onChange={v => updateProduct(p.id, 'price_per_unit', v)} placeholder="0.00" className="text-center font-semibold text-indigo-700" />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TSelect value={p.gst_percent} onChange={v => updateProduct(p.id, 'gst_percent', Number(v))} options={GST_RATES} />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TInput type="number" value={p.lead_time_days} onChange={v => updateProduct(p.id, 'lead_time_days', v)} placeholder="7" className="text-center" />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TInput value={p.warranty} onChange={v => updateProduct(p.id, 'warranty', v)} placeholder="1 Year" />
                                            </td>
                                            <td className="px-2 py-2 border-r border-gray-100">
                                                <TInput type="number" value={p.stock_qty} onChange={v => updateProduct(p.id, 'stock_qty', v)} placeholder="—" className="text-center" />
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button onClick={() => deleteProduct(p.id)} className="text-gray-200 hover:text-red-400 transition">
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t border-gray-100 px-4 py-3">
                            <button onClick={addProduct}
                                className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 font-semibold transition">
                                <Plus size={15} /> Add Product
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
                            onClick={handleSubmit}
                            disabled={!canSubmit || loading}
                            className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3.5
                                       rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200
                                       disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                            {loading
                                ? <><Loader2 size={17} className="animate-spin" /> Submitting…</>
                                : <><Send size={16} /> Submit Catalog</>
                            }
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
