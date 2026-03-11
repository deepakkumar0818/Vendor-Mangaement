import { Star, Award, Mail, Phone, TrendingUp, Package } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

function StarRow({ value }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{value > 0 ? value.toFixed(1) : '—'}</span>
        </div>
    );
}

const CATEGORY_COLORS = {
    'Raw Materials': { bg: 'bg-indigo-50',  text: 'text-indigo-600',  dot: 'bg-indigo-500'  },
    'Logistics':     { bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-500'    },
    'IT & Software': { bg: 'bg-violet-50',  text: 'text-violet-600',  dot: 'bg-violet-500'  },
    'Packaging':     { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    'MRO Supplies':  { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-500'   },
    'Professional':  { bg: 'bg-rose-50',    text: 'text-rose-600',    dot: 'bg-rose-500'    },
};
const DEFAULT_COLOR = { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };

export default function PreferredVendors() {
    const { vendors, dataLoading } = useAppData();

    const preferred = [...vendors]
        .filter(v => v.classification === 'Preferred')
        .sort((a, b) => b.score - a.score);

    // Group by category
    const byCategory = preferred.reduce((acc, v) => {
        acc[v.category] = acc[v.category] || [];
        acc[v.category].push(v);
        return acc;
    }, {});

    const categories = Object.keys(byCategory).sort();

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-indigo-600 fill-indigo-100" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Preferred Vendors</h1>
                    <p className="text-sm text-gray-400">Top-rated vendors for streamlined procurement decisions</p>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: 'Preferred Vendors', value: preferred.length,    color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
                    { label: 'Categories Covered', value: categories.length,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Avg. Score',         value: preferred.length ? Math.round(preferred.reduce((a, v) => a + v.score, 0) / preferred.length) : 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map(c => (
                    <div key={c.label} className={`${c.bg} rounded-xl p-4`}>
                        <p className="text-xs text-gray-500 font-medium mb-1">{c.label}</p>
                        <p className={`text-3xl font-extrabold ${c.color}`}>{dataLoading ? '—' : c.value}</p>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {dataLoading ? (
                <div className="space-y-4">
                    {[1,2].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : preferred.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Star size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No preferred vendors yet</p>
                    <p className="text-sm text-gray-300 mt-1">Mark vendors as "Preferred" in the Vendor Master to see them here</p>
                </div>
            ) : (
                <>
                    {/* Ranked leaderboard */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-gray-800">Preferred Vendor Ranking</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Sorted by composite score</p>
                            </div>
                            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full">{preferred.length} vendors</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        {['Rank','Vendor','Category','Score','ML Score','Rating','Status','Contact'].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {preferred.map((v, i) => {
                                        const clr = CATEGORY_COLORS[v.category] || DEFAULT_COLOR;
                                        return (
                                            <tr key={v._id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    {i === 0 ? <span className="text-amber-500 font-extrabold text-base">🥇</span>
                                                    : i === 1 ? <span className="text-gray-400 font-extrabold text-base">🥈</span>
                                                    : i === 2 ? <span className="text-amber-700 font-extrabold text-base">🥉</span>
                                                    : <span className="text-xs font-bold text-gray-400 px-2">#{i+1}</span>}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                                            {v.name.charAt(0)}
                                                        </div>
                                                        <span className="font-semibold text-gray-800">{v.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${clr.bg} ${clr.text}`}>{v.category}</span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${v.score}%` }} />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700">{v.score}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs font-semibold text-indigo-600">{v.mlPredictedScore > 0 ? v.mlPredictedScore : '—'}</td>
                                                <td className="px-5 py-3.5"><StarRow value={v.rating} /></td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">{v.status}</span>
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-gray-500">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="flex items-center gap-1"><Mail size={10} />{v.email}</span>
                                                        <span className="flex items-center gap-1"><Phone size={10} />{v.phone}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Category-wise breakdown */}
                    <div>
                        <h2 className="text-base font-bold text-gray-800 mb-4">Category-wise Preferred Vendors</h2>
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {categories.map(cat => {
                                const clr = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
                                const catVendors = byCategory[cat];
                                const top = catVendors[0];
                                return (
                                    <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`flex items-center gap-2 ${clr.text}`}>
                                                <Package size={16} />
                                                <span className="text-sm font-bold">{cat}</span>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${clr.bg} ${clr.text}`}>
                                                {catVendors.length} vendor{catVendors.length > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        {/* Top vendor highlight */}
                                        <div className={`${clr.bg} rounded-xl p-3 mb-3`}>
                                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Top Vendor</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-7 h-7 rounded-lg ${clr.bg} border border-white flex items-center justify-center text-xs font-bold ${clr.text}`}>
                                                        {top.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-800">{top.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                                                    <Award size={12} /> {top.score}
                                                </div>
                                            </div>
                                        </div>

                                        {/* All in category */}
                                        <div className="space-y-2">
                                            {catVendors.map(v => (
                                                <div key={v._id} className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600 truncate">{v.name}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="w-12 bg-gray-100 rounded-full h-1">
                                                            <div className={`${clr.dot} h-1 rounded-full`} style={{ width: `${v.score}%` }} />
                                                        </div>
                                                        <span className="font-semibold text-gray-700 w-6 text-right">{v.score}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
