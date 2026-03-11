import { useState } from 'react';
import {
    LayoutDashboard, BarChart3, Users, FileText, Plus, Upload,
    X, TrendingUp, Award, ShoppingCart, Clock,
    CheckCircle, AlertCircle,
} from 'lucide-react';
import { useAuth }    from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';

const CREATE_FIELDS = [
    { label: 'Vendor Name',   name: 'name',     placeholder: 'e.g. AlphaTech Supplies', type: 'text'  },
    { label: 'Category',      name: 'category', placeholder: 'e.g. Raw Materials',       type: 'text'  },
    { label: 'Contact Email', name: 'email',    placeholder: 'vendor@example.com',       type: 'email' },
    { label: 'Contact Phone', name: 'phone',    placeholder: '+91 98765 43210',          type: 'text'  },
    { label: 'GST / Tax ID',  name: 'gstId',    placeholder: 'GSTIN number',             type: 'text'  },
];

const ACTIVITY_STYLE = {
    rfq:    { color: 'text-indigo-500',  bg: 'bg-indigo-50',  Icon: FileText     },
    score:  { color: 'text-emerald-500', bg: 'bg-emerald-50', Icon: Award        },
    quote:  { color: 'text-amber-500',   bg: 'bg-amber-50',   Icon: ShoppingCart },
    vendor: { color: 'text-violet-500',  bg: 'bg-violet-50',  Icon: Users        },
    report: { color: 'text-blue-500',    bg: 'bg-blue-50',    Icon: BarChart3    },
};

// ── Loading skeleton card ──────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                    <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="mt-3 h-3 w-28 bg-gray-100 rounded" />
        </div>
    );
}

export default function Dashboard() {
    const [showCreate, setShowCreate] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [dragOver,   setDragOver]   = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', category: '', email: '', phone: '', gstId: '', classification: 'Preferred' });
    const [creating,   setCreating]   = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading,    setUploading]    = useState(false);

    const { user }                                                   = useAuth();
    const { dashboardStats, recentActivity, dataLoading,
            addVendor, uploadFile, uploadStatus }                    = useAppData();

    const statCards = [
        { label: 'Active Vendors',  value: dataLoading ? '—' : dashboardStats.activeVendors,                     icon: Users,    border: 'border-indigo-500'  },
        { label: 'Open RFQs',       value: dataLoading ? '—' : dashboardStats.openRFQs,                          icon: FileText, border: 'border-amber-500'   },
        { label: 'Quotes Received', value: dataLoading ? '—' : dashboardStats.quotesReceived,                    icon: BarChart3,border: 'border-emerald-500' },
        { label: 'Avg. Score',      value: dataLoading ? '—' : `${dashboardStats.avgScore}/100`,                  icon: Award,    border: 'border-violet-500'  },
    ];

    const handleCreateChange = e => setCreateForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleCreateVendor = async e => {
        e.preventDefault();
        setCreating(true);
        try {
            await addVendor(createForm);
            setShowCreate(false);
            setCreateForm({ name: '', category: '', email: '', phone: '', gstId: '', classification: 'Preferred' });
        } finally {
            setCreating(false);
        }
    };

    const handleFileDrop = e => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) setSelectedFile(file);
    };

    const handleFileSelect = e => {
        if (e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            await uploadFile(selectedFile, user._id);
            setShowUpload(false);
            setSelectedFile(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Dashboard'}
                        </h1>
                        <p className="text-sm text-gray-400">Vendor Management Overview</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                    >
                        <Plus size={16} /> Create Vendor
                    </button>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition shadow-sm"
                    >
                        <Upload size={16} /> Upload Data
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {dataLoading
                    ? [1,2,3,4].map(i => <SkeletonCard key={i} />)
                    : statCards.map(s => (
                        <div key={s.label} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${s.border}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                                    <p className="text-3xl font-extrabold text-gray-800 mt-1">{s.value}</p>
                                </div>
                                <s.icon size={28} className="text-gray-200" />
                            </div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-500 font-medium">
                                <TrendingUp size={12} /> <span>Updated live</span>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* ── Recent Activity ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                    <span className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">View all</span>
                </div>

                {dataLoading ? (
                    <div className="space-y-3">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="flex items-center gap-4 p-3 animate-pulse">
                                <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
                                <div className="flex-1 h-4 bg-gray-100 rounded" />
                                <div className="w-20 h-3 bg-gray-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : recentActivity.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                        <Clock size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No activity yet. Start by creating a vendor.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentActivity.map((item, i) => {
                            const style = ACTIVITY_STYLE[item.type] || ACTIVITY_STYLE.report;
                            return (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                                    <div className={`w-9 h-9 ${style.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                        <style.Icon size={16} className={style.color} />
                                    </div>
                                    <p className="text-sm text-gray-700 flex-1">{item.action}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                                        <Clock size={11} /> {item.time}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ══ CREATE VENDOR MODAL ══════════════════════════════════════════ */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Plus size={16} className="text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Create New Vendor</h2>
                            </div>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateVendor} className="px-6 py-5 space-y-4">
                            {CREATE_FIELDS.map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                                    <input
                                        name={f.name}
                                        type={f.type}
                                        value={createForm[f.name]}
                                        onChange={handleCreateChange}
                                        required={f.name === 'name'}
                                        placeholder={f.placeholder}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-gray-300"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                                <select
                                    name="classification"
                                    value={createForm.classification}
                                    onChange={handleCreateChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                                >
                                    <option>Preferred</option>
                                    <option>Regular</option>
                                    <option>Monitor</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                    {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Vendor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ══ UPLOAD DATA MODAL ════════════════════════════════════════════ */}
            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Upload size={16} className="text-indigo-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800">Upload Vendor Data</h2>
                            </div>
                            <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="px-6 py-6">
                            {/* Upload status banner */}
                            {uploadStatus === 'success' && (
                                <div className="mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                                    <CheckCircle size={16} /> File uploaded and processed successfully!
                                </div>
                            )}
                            {uploadStatus === 'error' && (
                                <div className="mb-4 flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl">
                                    <AlertCircle size={16} /> Upload failed. Please try again.
                                </div>
                            )}

                            {/* Drag & drop zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleFileDrop}
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer
                                    ${dragOver ? 'border-indigo-400 bg-indigo-50' : selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}`}
                            >
                                {selectedFile ? (
                                    <>
                                        <CheckCircle size={36} className="mx-auto mb-3 text-emerald-500" />
                                        <p className="text-sm font-semibold text-emerald-700 mb-1">{selectedFile.name}</p>
                                        <p className="text-xs text-emerald-600">{(selectedFile.size / 1024).toFixed(1)} KB — ready to upload</p>
                                        <button type="button" onClick={() => setSelectedFile(null)} className="mt-3 text-xs text-gray-400 hover:text-gray-600">Remove</button>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={36} className={`mx-auto mb-3 ${dragOver ? 'text-indigo-500' : 'text-gray-300'}`} />
                                        <p className="text-sm font-semibold text-gray-600 mb-1">Drag & drop your file here</p>
                                        <p className="text-xs text-gray-400 mb-4">Supports CSV, XLSX, XLS — max 10 MB</p>
                                        <label className="inline-block bg-indigo-600 text-white text-xs font-semibold px-5 py-2 rounded-full cursor-pointer hover:bg-indigo-700 transition">
                                            Browse File
                                            <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileSelect} />
                                        </label>
                                    </>
                                )}
                            </div>

                            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <p className="text-xs text-amber-700 font-medium">
                                    File must follow the VMS template format.{' '}
                                    <a href="#" className="underline">Download sample template →</a>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
                            <button onClick={() => { setShowUpload(false); setSelectedFile(null); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading
                                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                    : 'Upload & Import'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
