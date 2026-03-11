import { Award, Star, Activity, TrendingUp, Users } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

const CLASS_STYLE = {
    Preferred: { badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500', label: 'Preferred Vendor' },
    Regular:   { badge: 'bg-amber-100   text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-500',   label: 'Regular Vendor'   },
    Monitor:   { badge: 'bg-rose-100    text-rose-600',    ring: 'ring-rose-200',    dot: 'bg-rose-500',    label: 'Monitor'          },
};

// Derived score dimensions — will come from ML / API in production
function getDimensions(vendor) {
    const s = vendor.score;
    return [
        { label: 'Quality',   pct: Math.min(100, s + 3),  color: 'bg-indigo-500'  },
        { label: 'Delivery',  pct: Math.min(100, s - 4),  color: 'bg-emerald-500' },
        { label: 'Pricing',   pct: Math.min(100, s - 8),  color: 'bg-amber-500'   },
        { label: 'Support',   pct: Math.min(100, s + 5),  color: 'bg-violet-500'  },
        { label: 'Compliance',pct: Math.min(100, s + 1),  color: 'bg-blue-500'    },
    ];
}

function StarRow({ value }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
                <Star key={i} size={13} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
            ))}
        </div>
    );
}

function ScoreRing({ score }) {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e';
    const r = 36, circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
        <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-gray-800 leading-none">{score}</span>
                <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
            </div>
        </div>
    );
}

function VendorCard({ vendor }) {
    const cls = CLASS_STYLE[vendor.classification] || CLASS_STYLE.Regular;
    const dims = getDimensions(vendor);

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ring-1 ${cls.ring} p-6 flex flex-col gap-5`}>
            {/* Top row: avatar + name + class */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg shrink-0">
                        {vendor.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 leading-tight">{vendor.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{vendor.category}</p>
                    </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cls.badge}`}>
                    {vendor.classification}
                </span>
            </div>

            {/* Score ring + stats */}
            <div className="flex items-center gap-5">
                <ScoreRing score={vendor.score} />
                <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">ML Predicted</span>
                        <span className="font-bold text-indigo-600 flex items-center gap-1">
                            <Activity size={11} /> {vendor.mlPredictedScore > 0 ? vendor.mlPredictedScore : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">User Rating</span>
                        <StarRow value={vendor.rating} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Status</span>
                        <span className={`flex items-center gap-1 font-semibold ${vendor.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`} />
                            {vendor.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Score dimensions */}
            <div className="space-y-2">
                {dims.map(d => (
                    <div key={d.label}>
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-500">{d.label}</span>
                            <span className="text-xs font-semibold text-gray-700">{d.pct}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className={`${d.color} h-1.5 rounded-full transition-all`} style={{ width: `${d.pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Joined date */}
            <p className="text-xs text-gray-300 -mt-1">Onboarded: {vendor.createdAt}</p>
        </div>
    );
}

export default function Scorecard() {
    const { vendors, dataLoading } = useAppData();

    const preferred = vendors.filter(v => v.classification === 'Preferred');
    const regular   = vendors.filter(v => v.classification === 'Regular');
    const monitor   = vendors.filter(v => v.classification === 'Monitor');

    const avgScore  = vendors.length ? Math.round(vendors.reduce((a, v) => a + v.score, 0) / vendors.length) : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Vendor Scorecards</h1>
                    <p className="text-sm text-gray-400">Auto-generated scores with ML predictions and user ratings</p>
                </div>
            </div>

            {/* Summary strip */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Vendors',    value: vendors.length, icon: Users,      color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
                    { label: 'Preferred',        value: preferred.length,icon: Award,     color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Regular',          value: regular.length,  icon: TrendingUp,color: 'text-amber-600',   bg: 'bg-amber-50'   },
                    { label: 'Avg. Score',       value: avgScore,        icon: Star,      color: 'text-violet-600',  bg: 'bg-violet-50'  },
                ].map(c => (
                    <div key={c.label} className={`${c.bg} rounded-xl p-4 flex items-center gap-3`}>
                        <c.icon size={22} className={c.color} />
                        <div>
                            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
                            <p className={`text-2xl font-extrabold ${c.color}`}>{dataLoading ? '—' : c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading skeleton */}
            {dataLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : vendors.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                    <Award size={48} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No vendor scorecards yet</p>
                    <p className="text-sm text-gray-300 mt-1">Add vendors to generate scorecards automatically</p>
                </div>
            ) : (
                <>
                    {preferred.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Preferred Vendors ({preferred.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {preferred.map(v => <VendorCard key={v._id} vendor={v} />)}
                            </div>
                        </section>
                    )}
                    {regular.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500" /> Regular Vendors ({regular.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {regular.map(v => <VendorCard key={v._id} vendor={v} />)}
                            </div>
                        </section>
                    )}
                    {monitor.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-rose-500" /> Monitor ({monitor.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                {monitor.map(v => <VendorCard key={v._id} vendor={v} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
