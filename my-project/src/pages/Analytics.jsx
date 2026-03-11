import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Users, Award, ShieldCheck } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

const ICON_MAP   = { indigo: DollarSign, emerald: Users, amber: Award, violet: ShieldCheck };
const ICON_BG    = { indigo: 'bg-indigo-100',  emerald: 'bg-emerald-100', amber: 'bg-amber-100',  violet: 'bg-violet-100'  };
const ICON_CLR   = { indigo: 'text-indigo-600', emerald: 'text-emerald-600',amber: 'text-amber-600', violet: 'text-violet-600' };
const BAR_COLOR  = { indigo: 'bg-indigo-500',  emerald: 'bg-emerald-500', amber: 'bg-amber-500',  violet: 'bg-violet-500'  };

const ChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-3 text-sm">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color }} className="font-medium">
                    {p.name}: {prefix}{p.value}{suffix}
                </p>
            ))}
        </div>
    );
};

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + r * Math.sin(-midAngle * (Math.PI / 180));
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ── Skeleton loader ────────────────────────────────────────────────────────────
function SkeletonBox({ h = 'h-60' }) {
    return <div className={`${h} bg-gray-100 rounded-xl animate-pulse`} />;
}

export default function Analytics() {
    const { analyticsData, vendors, dataLoading } = useAppData();

    // Classification breakdown from live vendor data
    const preferred = vendors.filter(v => v.classification === 'Preferred').length;
    const regular   = vendors.filter(v => v.classification === 'Regular').length;
    const monitor   = vendors.filter(v => v.classification === 'Monitor').length;
    const total     = vendors.length || 1;

    const classificationData = [
        { name: 'Preferred', value: preferred, color: '#10b981' },
        { name: 'Regular',   value: regular,   color: '#f59e0b' },
        { name: 'Monitor',   value: monitor,   color: '#f43f5e' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Vendor Intelligence</h1>
                <p className="text-sm text-gray-400 mt-1">Procurement analytics · powered by your data</p>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {dataLoading || !analyticsData
                    ? [1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse"><div className="h-32 bg-gray-100 rounded-xl" /></div>)
                    : analyticsData.kpis.map(k => {
                        const Icon = ICON_MAP[k.color] || Award;
                        return (
                            <div key={k.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-10 h-10 ${ICON_BG[k.color]} rounded-xl flex items-center justify-center`}>
                                        <Icon size={18} className={ICON_CLR[k.color]} />
                                    </div>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${k.up ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                        {k.change}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{k.label}</p>
                                <p className="text-2xl font-extrabold text-gray-800 mb-3">{k.value}</p>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className={`${BAR_COLOR[k.color]} h-1.5 rounded-full`} style={{ width: `${k.pct}%` }} />
                                </div>
                            </div>
                        );
                    })
                }
            </div>

            {/* ── Charts Row 1 ── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Monthly Spend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Monthly Spend</h2>
                            <p className="text-xs text-gray-400">Last 6 months · ₹ Lakhs</p>
                        </div>
                        <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full">Vertical Bar</span>
                    </div>
                    {dataLoading || !analyticsData ? <SkeletonBox /> : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={analyticsData.monthlySpend} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="L" />
                                <Tooltip content={<ChartTooltip prefix="₹" suffix=" L" />} cursor={{ fill: '#f1f5f9', radius: 6 }} />
                                <Bar dataKey="spend" name="Spend" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Vendor Score Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Vendor Score Trend</h2>
                            <p className="text-xs text-gray-400">Avg. score by classification · last 6 months</p>
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-3 py-1 rounded-full">Line Chart</span>
                    </div>
                    {dataLoading || !analyticsData ? <SkeletonBox /> : (
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={analyticsData.scoreTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[30, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip suffix=" pts" />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                                <Line type="monotone" dataKey="preferred" name="Preferred" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="regular"   name="Regular"   stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="monitor"   name="Monitor"   stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} strokeDasharray="5 4" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* ── Charts Row 2 ── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Spend by Category */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Spend by Category</h2>
                            <p className="text-xs text-gray-400">YTD · ₹ Lakhs</p>
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-3 py-1 rounded-full">Horizontal Bar</span>
                    </div>
                    {dataLoading || !analyticsData ? <SkeletonBox h="h-64" /> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={analyticsData.categorySpend} layout="vertical" barSize={18}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} unit="L" />
                                <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip prefix="₹" suffix=" L" />} cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="spend" name="Spend" fill="#f59e0b" radius={[0, 6, 6, 0]}>
                                    {analyticsData.categorySpend.map((_, i) => (
                                        <Cell key={i} fill={`hsl(${38 + i * 12}, 90%, ${58 - i * 3}%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Vendor Classification Pie */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-base font-bold text-gray-800">Vendor Classification</h2>
                            <p className="text-xs text-gray-400">Distribution of {vendors.length} active vendors</p>
                        </div>
                        <span className="text-xs bg-violet-50 text-violet-600 font-semibold px-3 py-1 rounded-full">Pie Chart</span>
                    </div>
                    {dataLoading ? <SkeletonBox h="h-56" /> : (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="55%" height={220}>
                                <PieChart>
                                    <Pie data={classificationData} cx="50%" cy="50%" outerRadius={95} innerRadius={48} dataKey="value" labelLine={false} label={renderPieLabel}>
                                        {classificationData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [`${v} vendors`, n]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-4">
                                {classificationData.map(d => (
                                    <div key={d.name}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                                                <span className="text-sm font-medium text-gray-700">{d.name}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">{d.value}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="h-1.5 rounded-full" style={{ width: `${Math.round(d.value / total * 100)}%`, background: d.color }} />
                                        </div>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-400 pt-1">Total: {vendors.length} vendors</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── KPI Summary Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">KPI Summary — All Vendors</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Vertical performance breakdown by key metric</p>
                </div>
                {dataLoading || !analyticsData ? (
                    <div className="p-6 space-y-3">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">KPI Metric</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Target</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actual</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.kpiTable.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                                        <td className="px-6 py-3.5 font-medium text-gray-700">{row.metric}</td>
                                        <td className="px-4 py-3.5 text-center text-gray-500">{row.target}</td>
                                        <td className="px-4 py-3.5 text-center font-semibold text-gray-800">{row.actual}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${row.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {row.ok ? 'On Track' : 'Near Target'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${row.ok ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500 w-8 shrink-0">{row.pct}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
