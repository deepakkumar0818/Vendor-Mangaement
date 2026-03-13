import { useState, useEffect } from 'react';
import { Store, CheckCircle, AlertCircle, Loader2, Save, Tag, Phone, MapPin, FileText, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:8000/api';

const ALL_CATEGORIES = [
    'Electronics & Electrical',
    'IT Equipment & Computers',
    'Office Supplies & Stationery',
    'Furniture & Fixtures',
    'HVAC & Cooling Systems',
    'Industrial Machinery & Equipment',
    'Safety & Security',
    'Packaging & Storage',
    'Raw Materials & Metals',
    'Printing & Marketing',
    'Facility Management & Cleaning',
    'Vehicles & Transport',
    'Medical & Healthcare',
    'Construction & Civil',
    'Food & Beverages',
    'Textiles & Uniforms',
    'Plumbing & Sanitary',
    'Power & Energy Solutions',
];

export default function VendorPortal() {
    const { authFetch, user } = useAuth();

    const [form,    setForm]    = useState({ companyName: '', description: '', location: '', phone: '' });
    const [cats,    setCats]    = useState([]);  // selected categories
    const [loading, setLoading] = useState(true);
    const [saving,  setSaving]  = useState(false);
    const [success, setSuccess] = useState(false);
    const [error,   setError]   = useState('');

    // Load existing profile
    useEffect(() => {
        authFetch(`${API}/vendor/profile`)
            .then(r => r.json())
            .then(data => {
                if (data.profile) {
                    const p = data.profile;
                    setForm({
                        companyName:  p.companyName  || '',
                        description:  p.description  || '',
                        location:     p.location     || '',
                        phone:        p.phone        || '',
                    });
                    setCats(p.categories || []);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggleCat = (cat) => {
        setCats(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleSave = async () => {
        setError('');
        setSuccess(false);
        if (!form.companyName.trim()) {
            setError('Company name is required.');
            return;
        }
        if (cats.length === 0) {
            setError('Please select at least one supply category.');
            return;
        }
        setSaving(true);
        try {
            const res = await authFetch(`${API}/vendor/profile`, {
                method:  'PUT',
                body:    JSON.stringify({ ...form, categories: cats }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save profile.');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 4000);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Store className="h-8 w-8 text-indigo-600 shrink-0" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vendor Profile</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Set up your profile and select the categories you supply — clients will send you RFQs matching your categories
                    </p>
                </div>
            </div>

            {/* Success */}
            {success && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5">
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                    <p className="text-sm font-semibold text-green-800">Profile saved successfully! You will now receive RFQs for your selected categories.</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5">
                    <AlertCircle size={18} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <h2 className="font-bold text-gray-700 flex items-center gap-2">
                    <User size={16} className="text-indigo-500" /> Company Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Company / Vendor Name" required
                        value={form.companyName}
                        onChange={v => setForm(f => ({ ...f, companyName: v }))}
                        placeholder="e.g. ABC Electronics Pvt. Ltd."
                    />
                    <Field label="Phone Number" icon={<Phone size={13} />}
                        value={form.phone}
                        onChange={v => setForm(f => ({ ...f, phone: v }))}
                        placeholder="e.g. 9876543210"
                    />
                    <Field label="Location / City" icon={<MapPin size={13} />}
                        value={form.location}
                        onChange={v => setForm(f => ({ ...f, location: v }))}
                        placeholder="e.g. Mumbai, Maharashtra"
                        className="sm:col-span-2"
                    />
                    <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                            <FileText size={11} /> About / Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                            placeholder="Brief description of your business, experience, specialisation..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700
                                       placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-700 flex items-center gap-2">
                        <Tag size={16} className="text-indigo-500" /> Supply Categories
                    </h2>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
                        {cats.length} selected
                    </span>
                </div>
                <p className="text-xs text-gray-400">
                    Select all categories that you supply products or services for. You will receive RFQ notifications only for your selected categories.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                    {ALL_CATEGORIES.map(cat => {
                        const selected = cats.includes(cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => toggleCat(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                    selected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* How it works */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
                <h3 className="font-bold text-indigo-800 text-sm mb-3">How the RFQ system works</h3>
                <ol className="space-y-2 text-sm text-indigo-700">
                    <li className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">1</span>
                        A client posts an RFQ (Request for Quotation) for a product in one of your categories.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">2</span>
                        You receive an email notification with the RFQ details.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">3</span>
                        Go to <strong>RFQ Inbox</strong> to view the RFQ and submit your price quote.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">4</span>
                        The client reviews all vendor quotes and selects the best offer.
                    </li>
                </ol>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-8 py-3.5
                               rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200
                               disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                    {saving
                        ? <><Loader2 size={17} className="animate-spin" /> Saving…</>
                        : <><Save size={16} /> Save Profile</>
                    }
                </button>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, required, icon, className = '' }) {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                {icon} {label}{required && <span className="text-red-400">*</span>}
            </label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700
                           placeholder-gray-300 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 bg-white"
            />
        </div>
    );
}
