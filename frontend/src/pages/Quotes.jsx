import { useState, useMemo } from 'react';
import { FileText, Plus, Search, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth }    from '../context/AuthContext';

const STATUS_STYLE = {
    Received: { badge: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle },
    Pending:  { badge: 'bg-amber-100   text-amber-700',   Icon: Clock       },
    Declined: { badge: 'bg-rose-100    text-rose-600',    Icon: XCircle     },
};

const RFQ_FIELDS = [
    { label: 'RFQ Number',   name: 'rfqNo',    placeholder: 'e.g. RFQ-1043',          type: 'text'   },
    { label: 'Vendor Name',  name: 'vendor',   placeholder: 'e.g. AlphaTech Supplies', type: 'text'   },
    { label: 'Category',     name: 'category', placeholder: 'e.g. Raw Materials',       type: 'text'   },
    { label: 'No. of Items', name: 'items',    placeholder: 'e.g. 10',                 type: 'number' },
];

export default function Quotes() {
    const { quotes, dataLoading } = useAppData();
    const { user }                = useAuth();

    const [search,      setSearch]      = useState('');
    const [filterStat,  setFilterStat]  = useState('All');
    const [showCreate,  setShowCreate]  = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [extraQuotes, setExtraQuotes] = useState([]);
    const [form, setForm] = useState({ rfqNo: '', vendor: '', category: '', items: '', amount: '—', status: 'Pending', date: new Date().toISOString().split('T')[0] });

    const allQuotes = [...(quotes ?? []), ...extraQuotes];

    const filtered = useMemo(() => {
        let list = allQuotes;
        if (search)              list = list.filter(q => [q.rfqNo, q.vendor, q.category].some(f => f.toLowerCase().includes(search.toLowerCase())));
        if (filterStat !== 'All') list = list.filter(q => q.status === filterStat);
        return list;
    }, [allQuotes, search, filterStat]);

    const counts = useMemo(() => ({
        total:    allQuotes.length,
        received: allQuotes.filter(q => q.status === 'Received').length,
        pending:  allQuotes.filter(q => q.status === 'Pending').length,
        declined: allQuotes.filter(q => q.status === 'Declined').length,
    }), [allQuotes]);

    const summaryCards = [
        { label: 'Total RFQs',       value: counts.total,    border: 'border-indigo-500',  text: 'text-indigo-700'  },
        { label: 'Quotes Received',  value: counts.received, border: 'border-emerald-500', text: 'text-emerald-700' },
        { label: 'Pending Response', value: counts.pending,  border: 'border-amber-500',   text: 'text-amber-700'   },
        { label: 'Declined',         value: counts.declined, border: 'border-rose-500',    text: 'text-rose-600'    },
    ];

    const handleCreate = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            // TODO: const res = await axios.post('/api/quotes', { ...form, userId: user._id });
            await new Promise(r => setTimeout(r, 600));
            setExtraQuotes(prev => [{ ...form, _id: 'q_' + Date.now(), items: Number(form.items) }, ...prev]);
            setShowCreate(false);
            setForm({ rfqNo: '', vendor: '', category: '', items: '', amount: '—', status: 'Pending', date: new Date().toISOString().split('T')[0] });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">RFQ & Quotes</h1>
                        <p className="text-sm text-gray-400">Issue RFQs and track vendor quotations</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                >
                    <Plus size={16} /> Create RFQ
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {summaryCards.map(c => (
                    <div key={c.label} className={`bg-white rounded-xl border-l-4 ${c.border} p-4 shadow-sm`}>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{c.label}</p>
                        <p className={`text-3xl font-extrabold ${c.text}`}>{dataLoading ? '—' : c.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" placeholder="Search by RFQ #, vendor or category…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    />
                </div>
                <select
                    value={filterStat} onChange={e => setFilterStat(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-700"
                >
                    {['All','Received','Pending','Declined'].map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {dataLoading ? (
                    <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center">
                        <FileText size={48} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 font-medium">No RFQs found</p>
                        <p className="text-sm text-gray-300 mt-1">Create your first RFQ to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {['RFQ #','Vendor','Category','Status','Date','Amount','Items'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(q => {
                                    const st = STATUS_STYLE[q.status] || STATUS_STYLE.Pending;
                                    return (
                                        <tr key={q._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-3.5 font-semibold text-indigo-600">{q.rfqNo}</td>
                                            <td className="px-5 py-3.5 text-gray-800 font-medium">{q.vendor}</td>
                                            <td className="px-5 py-3.5 text-gray-500">{q.category}</td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.badge}`}>
                                                    <st.Icon size={11} /> {q.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500">{q.date}</td>
                                            <td className="px-5 py-3.5 font-semibold text-gray-800">{q.amount}</td>
                                            <td className="px-5 py-3.5 text-gray-500">{q.items}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {!dataLoading && filtered.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {allQuotes.length} records
                    </div>
                )}
            </div>

            {/* Create RFQ Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Create New RFQ</h2>
                            <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                            {RFQ_FIELDS.map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                                    <input
                                        name={f.name} type={f.type} required value={form[f.name]}
                                        onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                        placeholder={f.placeholder}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-300"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                                    {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send RFQ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
