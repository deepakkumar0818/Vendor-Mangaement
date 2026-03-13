import { useState, useEffect, useCallback } from 'react';
import {
    Inbox, Send, Clock, MapPin, Package, Tag, CheckCircle,
    AlertCircle, Loader2, ChevronDown, ChevronUp, X, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

const STATUS_COLORS = {
    open:   'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-500',
    awarded:'bg-blue-100 text-blue-700',
};

export default function VendorRFQInbox() {
    const { authFetch } = useAuth();

    const [rfqs,       setRfqs]       = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState('');
    const [expanded,   setExpanded]   = useState(null);  // rfqId of expanded card
    const [quoteModal, setQuoteModal] = useState(null);  // rfq object for modal

    const loadRFQs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res  = await authFetch(`${API}/vendor/rfq`);
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

    const openRFQs     = rfqs.filter(r => !r.alreadyResponded && r.status === 'open');
    const respondedRFQs = rfqs.filter(r => r.alreadyResponded);
    const closedRFQs   = rfqs.filter(r => r.status !== 'open' && !r.alreadyResponded);

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Inbox className="h-8 w-8 text-indigo-600 shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">RFQ Inbox</h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Client requests matching your supply categories
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadRFQs}
                    disabled={loading}
                    className="flex items-center gap-2 text-sm text-indigo-600 border border-indigo-200 px-4 py-2 rounded-xl hover:bg-indigo-50 transition disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Open RFQs',    value: openRFQs.length,      color: 'text-green-600',  bg: 'bg-green-50'  },
                    { label: 'Responded',    value: respondedRFQs.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Total Received', value: rfqs.length,        color: 'text-gray-700',   bg: 'bg-gray-50'   },
                ].map(k => (
                    <div key={k.label} className={`${k.bg} rounded-2xl p-4 text-center`}>
                        <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
                    </div>
                ))}
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <AlertCircle size={15} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="animate-spin text-indigo-400" size={32} />
                </div>
            ) : rfqs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <Inbox size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No RFQs yet</p>
                    <p className="text-sm mt-1">Make sure you have selected supply categories in your profile.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Open RFQs */}
                    {openRFQs.length > 0 && (
                        <Section title="Open — Awaiting Your Quote" count={openRFQs.length} color="green">
                            {openRFQs.map(rfq => (
                                <RFQCard
                                    key={rfq._id}
                                    rfq={rfq}
                                    expanded={expanded === rfq._id}
                                    onToggle={() => setExpanded(expanded === rfq._id ? null : rfq._id)}
                                    onQuote={() => setQuoteModal(rfq)}
                                />
                            ))}
                        </Section>
                    )}

                    {/* Already responded */}
                    {respondedRFQs.length > 0 && (
                        <Section title="Already Responded" count={respondedRFQs.length} color="indigo">
                            {respondedRFQs.map(rfq => (
                                <RFQCard
                                    key={rfq._id}
                                    rfq={rfq}
                                    expanded={expanded === rfq._id}
                                    onToggle={() => setExpanded(expanded === rfq._id ? null : rfq._id)}
                                    responded
                                />
                            ))}
                        </Section>
                    )}

                    {/* Closed */}
                    {closedRFQs.length > 0 && (
                        <Section title="Closed RFQs" count={closedRFQs.length} color="gray">
                            {closedRFQs.map(rfq => (
                                <RFQCard
                                    key={rfq._id}
                                    rfq={rfq}
                                    expanded={expanded === rfq._id}
                                    onToggle={() => setExpanded(expanded === rfq._id ? null : rfq._id)}
                                />
                            ))}
                        </Section>
                    )}
                </div>
            )}

            {/* Quote Modal */}
            {quoteModal && (
                <QuoteModal
                    rfq={quoteModal}
                    authFetch={authFetch}
                    onClose={() => setQuoteModal(null)}
                    onSuccess={() => { setQuoteModal(null); loadRFQs(); }}
                />
            )}
        </div>
    );
}

/* ─── Section wrapper ─────────────────────────────────────────────────────── */
function Section({ title, count, color, children }) {
    const colors = {
        green:  'text-green-700 bg-green-100',
        indigo: 'text-indigo-700 bg-indigo-100',
        gray:   'text-gray-600 bg-gray-100',
    };
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[color]}`}>{count}</span>
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">{title}</h2>
            </div>
            {children}
        </div>
    );
}

/* ─── RFQ Card ────────────────────────────────────────────────────────────── */
function RFQCard({ rfq, expanded, onToggle, onQuote, responded }) {
    const deadline = rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
    const created  = new Date(rfq.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

    return (
        <div className={`bg-white rounded-2xl border transition-all ${expanded ? 'border-indigo-300 shadow-md' : 'border-gray-100 shadow-sm'}`}>
            {/* Card header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 p-4 text-left"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{rfq.rfqNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLORS[rfq.status] || 'bg-gray-100 text-gray-500'}`}>
                            {rfq.status}
                        </span>
                        {responded && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center gap-1">
                                <CheckCircle size={11} /> Quoted
                            </span>
                        )}
                    </div>
                    <p className="font-semibold text-gray-700 mt-1">{rfq.productName}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Tag size={11} />{rfq.category}</span>
                        <span className="flex items-center gap-1"><Package size={11} />Qty: {rfq.quantity}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} />{rfq.deliveryLocation}</span>
                        <span className="flex items-center gap-1"><Clock size={11} />Posted: {created}</span>
                    </div>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                    {rfq.responseCount > 0 && (
                        <span className="text-xs text-gray-400">{rfq.responseCount} response{rfq.responseCount !== 1 ? 's' : ''}</span>
                    )}
                    {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
            </button>

            {/* Expanded details */}
            {expanded && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <Info label="Deadline" value={deadline} />
                        <Info label="Responses so far" value={rfq.responseCount} />
                        {rfq.description && <Info label="Description" value={rfq.description} className="col-span-2" />}
                    </div>

                    {!responded && rfq.status === 'open' && (
                        <div className="pt-1">
                            <button
                                onClick={onQuote}
                                className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm shadow-indigo-200"
                            >
                                <Send size={14} /> Submit Your Quote
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function Info({ label, value, className = '' }) {
    return (
        <div className={className}>
            <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
            <p className="text-gray-700 mt-0.5">{value || '—'}</p>
        </div>
    );
}

/* ─── Quote Modal ─────────────────────────────────────────────────────────── */
function QuoteModal({ rfq, authFetch, onClose, onSuccess }) {
    const [form, setForm] = useState({
        price:           '',
        discount:        '0',
        deliveryTime:    '',
        deliveryCharges: '0',
        paymentTerms:    'Net 30',
        warranty:        '',
        message:         '',
    });
    const [saving, setSaving] = useState(false);
    const [error,  setError]  = useState('');

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async () => {
        setError('');
        if (!form.price || isNaN(parseFloat(form.price))) {
            setError('Please enter a valid price.');
            return;
        }
        if (!form.deliveryTime || isNaN(parseInt(form.deliveryTime))) {
            setError('Please enter delivery time in days.');
            return;
        }
        setSaving(true);
        try {
            const res = await authFetch(`${API}/vendor/rfq/${rfq._id}/respond`, {
                method: 'POST',
                body:   JSON.stringify({
                    price:           parseFloat(form.price),
                    discount:        parseFloat(form.discount) || 0,
                    deliveryTime:    parseInt(form.deliveryTime),
                    deliveryCharges: parseFloat(form.deliveryCharges) || 0,
                    paymentTerms:    form.paymentTerms,
                    warranty:        form.warranty,
                    message:         form.message,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to submit quote.');
            onSuccess();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Modal header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="font-bold text-gray-800">Submit Quote</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{rfq.rfqNumber} · {rfq.productName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {/* RFQ summary */}
                <div className="mx-5 mt-4 bg-indigo-50 rounded-xl p-3 text-sm text-indigo-700 space-y-1">
                    <p><strong>Product:</strong> {rfq.productName}</p>
                    <p><strong>Category:</strong> {rfq.category}</p>
                    <p><strong>Quantity:</strong> {rfq.quantity}</p>
                    <p><strong>Delivery to:</strong> {rfq.deliveryLocation}</p>
                </div>

                {/* Form */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <MField label="Unit Price (₹)" required value={form.price}
                            onChange={v => upd('price', v)} type="number" placeholder="e.g. 5000" />
                        <MField label="Discount %" value={form.discount}
                            onChange={v => upd('discount', v)} type="number" placeholder="0" />
                        <MField label="Delivery Time (days)" required value={form.deliveryTime}
                            onChange={v => upd('deliveryTime', v)} type="number" placeholder="e.g. 7" />
                        <MField label="Delivery Charges (₹)" value={form.deliveryCharges}
                            onChange={v => upd('deliveryCharges', v)} type="number" placeholder="0" />
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Terms</label>
                            <select
                                value={form.paymentTerms}
                                onChange={e => upd('paymentTerms', e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300"
                            >
                                {['Advance', 'Net 15', 'Net 30', 'Net 45', 'COD', '50% Advance + 50% on delivery'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <MField label="Warranty" value={form.warranty}
                            onChange={v => upd('warranty', v)} placeholder="e.g. 1 Year" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message to Client (optional)</label>
                        <textarea
                            value={form.message}
                            onChange={e => upd('message', e.target.value)}
                            rows={3}
                            placeholder="Any additional info, notes, or terms for the client..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700
                                       placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                        />
                    </div>

                    {/* Effective price preview */}
                    {form.price && !isNaN(parseFloat(form.price)) && (
                        <div className="bg-gray-50 rounded-xl p-3 text-sm">
                            <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Quote Preview</p>
                            <div className="flex justify-between text-gray-700">
                                <span>Unit Price</span>
                                <span className="font-semibold">₹{parseFloat(form.price).toLocaleString()}</span>
                            </div>
                            {parseFloat(form.discount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount ({form.discount}%)</span>
                                    <span>-₹{(parseFloat(form.price) * parseFloat(form.discount) / 100).toLocaleString()}</span>
                                </div>
                            )}
                            {parseFloat(form.deliveryCharges) > 0 && (
                                <div className="flex justify-between text-gray-700">
                                    <span>Delivery Charges</span>
                                    <span>₹{parseFloat(form.deliveryCharges).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 mt-1 pt-1">
                                <span>Effective Price</span>
                                <span className="text-indigo-700">
                                    ₹{(parseFloat(form.price) * (1 - (parseFloat(form.discount) || 0) / 100) + (parseFloat(form.deliveryCharges) || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            <AlertCircle size={15} className="text-red-500 shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit Quote</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MField({ label, value, onChange, type = 'text', placeholder, required }) {
    return (
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
                           placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-300"
            />
        </div>
    );
}
