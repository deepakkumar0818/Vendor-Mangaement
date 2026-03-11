import { useState, useMemo } from 'react';
import {
    Users, Plus, Search, Filter, Edit2, Trash2, X,
    ChevronUp, ChevronDown, Star, Activity, Mail, Phone,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

const CLASSIFICATIONS = ['All', 'Preferred', 'Regular', 'Monitor'];
const CATEGORIES      = ['All', 'Raw Materials', 'Logistics', 'IT & Software', 'Packaging', 'MRO Supplies', 'Professional'];

const BADGE = {
    Preferred: 'bg-emerald-100 text-emerald-700',
    Regular:   'bg-amber-100   text-amber-700',
    Monitor:   'bg-rose-100    text-rose-600',
};
const STATUS_BADGE = {
    Active:        'bg-emerald-50 text-emerald-600',
    'Under Review':'bg-amber-50   text-amber-600',
    Inactive:      'bg-gray-100   text-gray-500',
};

function StarRating({ value }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{value > 0 ? value.toFixed(1) : '—'}</span>
        </div>
    );
}

function ScoreBadge({ score }) {
    const color = score >= 80 ? 'text-emerald-600 bg-emerald-50' : score >= 60 ? 'text-amber-600 bg-amber-50' : 'text-rose-600 bg-rose-50';
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>{score > 0 ? score : '—'}</span>;
}

const EDIT_FIELDS = [
    { label: 'Vendor Name',   name: 'name',     type: 'text'  },
    { label: 'Category',      name: 'category', type: 'text'  },
    { label: 'Contact Email', name: 'email',    type: 'email' },
    { label: 'Contact Phone', name: 'phone',    type: 'text'  },
    { label: 'GST / Tax ID',  name: 'gstId',    type: 'text'  },
];

function VendorModal({ editVendor, form, setForm, handleSave, saving, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">{editVendor ? 'Edit Vendor' : 'Create New Vendor'}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
                </div>
                <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                    {EDIT_FIELDS.map(f => (
                        <div key={f.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                            <input
                                name={f.name} type={f.type} value={form[f.name]} required={f.name === 'name'}
                                onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300"
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
                        <select
                            name="classification" value={form.classification}
                            onChange={e => setForm(p => ({ ...p, classification: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                        >
                            {['Preferred', 'Regular', 'Monitor'].map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editVendor ? 'Save Changes' : 'Create Vendor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Vendors() {
    const { vendors, dataLoading, addVendor, updateVendor, deleteVendor } = useAppData();

    const [search,         setSearch]         = useState('');
    const [filterClass,    setFilterClass]    = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortKey,        setSortKey]        = useState('name');
    const [sortDir,        setSortDir]        = useState('asc');
    const [showCreate,     setShowCreate]     = useState(false);
    const [editVendor,     setEditVendor]     = useState(null);
    const [deleteTarget,   setDeleteTarget]   = useState(null);
    const [saving,         setSaving]         = useState(false);
    const [form,           setForm]           = useState({ name: '', category: '', email: '', phone: '', gstId: '', classification: 'Preferred' });

    const handleSort = key => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const filtered = useMemo(() => {
        let list = vendors;
        if (search)              list = list.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()));
        if (filterClass !== 'All')    list = list.filter(v => v.classification === filterClass);
        if (filterCategory !== 'All') list = list.filter(v => v.category === filterCategory);
        return [...list].sort((a, b) => {
            const av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
            const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [vendors, search, filterClass, filterCategory, sortKey, sortDir]);

    const SortIcon = ({ col }) => {
        if (sortKey !== col) return <ChevronUp size={12} className="text-gray-300" />;
        return sortDir === 'asc' ? <ChevronUp size={12} className="text-indigo-600" /> : <ChevronDown size={12} className="text-indigo-600" />;
    };

    const openCreate = () => {
        setForm({ name: '', category: '', email: '', phone: '', gstId: '', classification: 'Preferred' });
        setShowCreate(true);
    };

    const openEdit = v => {
        setForm({ name: v.name, category: v.category, email: v.email, phone: v.phone, gstId: v.gstId, classification: v.classification });
        setEditVendor(v);
    };

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editVendor) {
                await updateVendor(editVendor._id, form);
                setEditVendor(null);
            } else {
                await addVendor(form);
                setShowCreate(false);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteVendor(deleteTarget._id);
        setDeleteTarget(null);
    };

    const colHeader = (label, key) => (
        <th
            className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none hover:text-gray-600"
            onClick={() => handleSort(key)}
        >
            <span className="flex items-center gap-1">{label} <SortIcon col={key} /></span>
        </th>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Vendor Master</h1>
                        <p className="text-sm text-gray-400">{vendors.length} vendors in your directory</p>
                    </div>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                >
                    <Plus size={16} /> Add Vendor
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" placeholder="Search by name, category or email…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400 shrink-0" />
                    <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700">
                        {CLASSIFICATIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700">
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {dataLoading ? (
                    <div className="p-8 space-y-3">
                        {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <Users size={48} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No vendors found</p>
                        <p className="text-sm text-gray-300 mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {colHeader('Vendor', 'name')}
                                    {colHeader('Category', 'category')}
                                    {colHeader('Score', 'score')}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Classification</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                                    {colHeader('ML Score', 'mlPredictedScore')}
                                    {colHeader('Rating', 'rating')}
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Contact</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(v => (
                                    <tr key={v._id} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0">
                                                    {v.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">{v.name}</p>
                                                    <p className="text-xs text-gray-400">{v.gstId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600">{v.category}</td>
                                        <td className="px-4 py-3.5"><ScoreBadge score={v.score} /></td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE[v.classification] || 'bg-gray-100 text-gray-600'}`}>
                                                {v.classification}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[v.status] || STATUS_BADGE.Inactive}`}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1 text-xs text-indigo-600 font-semibold">
                                                <Activity size={12} />
                                                {v.mlPredictedScore > 0 ? v.mlPredictedScore : '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5"><StarRating value={v.rating} /></td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Mail size={10} /> {v.email}</span>
                                                <span className="flex items-center gap-1"><Phone size={10} /> {v.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition" title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => setDeleteTarget(v)} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition" title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!dataLoading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {vendors.length} vendors
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreate && <VendorModal editVendor={null} form={form} setForm={setForm} handleSave={handleSave} saving={saving} onClose={() => setShowCreate(false)} />}

            {/* Edit Modal */}
            {editVendor && <VendorModal editVendor={editVendor} form={form} setForm={setForm} handleSave={handleSave} saving={saving} onClose={() => setEditVendor(null)} />}

            {/* Delete Confirm */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={22} className="text-rose-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Vendor?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span> will be permanently removed from your directory.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
