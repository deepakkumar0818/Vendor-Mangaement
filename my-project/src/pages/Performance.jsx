import { BarChart3, TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

// Derived from vendor data — replace rows with API response once backend is ready
const STATIC_KPIS = [
    { metric: 'On-Time Delivery Rate',   target: 95,  actual: 91,  unit: '%',   trend: 'down', note: 'Down 2% from last month'         },
    { metric: 'Quote Response Time',     target: 6,   actual: 4.2, unit: 'h',   trend: 'up',   note: 'Avg. 4.2 hrs — within SLA'       },
    { metric: 'Defect / Return Rate',    target: 1,   actual: 0.8, unit: '%',   trend: 'up',   note: '0.2% below target threshold'     },
    { metric: 'Order Fulfilment Rate',   target: 98,  actual: 96,  unit: '%',   trend: 'flat', note: 'Consistent — monitor closely'    },
    { metric: 'Preferred Vendor Usage',  target: 80,  actual: 87,  unit: '%',   trend: 'up',   note: 'Exceeding procurement goal'       },
    { metric: 'Cost Savings vs. Budget', target: 30,  actual: 35,  unit: '%',   trend: 'up',   note: 'Outperforming budget target'      },
    { metric: 'Invoice Accuracy Rate',   target: 98,  actual: 94,  unit: '%',   trend: 'down', note: 'Needs attention — 3 disputes'    },
    { metric: 'Supplier Lead Time',      target: 7,   actual: 8.5, unit: 'd',   trend: 'down', note: 'Exceeding target by 1.5 days'    },
];

const VENDOR_KPI_COLS = ['On-Time %', 'Response', 'Defect %', 'Fulfilment %', 'Score'];

function TrendIcon({ trend }) {
    if (trend === 'up')   return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-gray-400" />;
}

function StatusPill({ target, actual, unit, lowerIsBetter = false }) {
    const ok = lowerIsBetter ? actual <= target : actual >= target;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${ok ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {ok ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
            {ok ? 'On Track' : 'Near Target'}
        </span>
    );
}

export default function Performance() {
    const { vendors, dataLoading } = useAppData();

    // Build per-vendor performance rows from vendor data
    const vendorRows = vendors.map(v => ({
        name:        v.name,
        onTime:      Math.min(100, 75 + v.score * 0.25).toFixed(0),
        response:    (6 - v.score * 0.03).toFixed(1),
        defect:      Math.max(0.1, 2 - v.score * 0.015).toFixed(1),
        fulfilment:  Math.min(100, 80 + v.score * 0.2).toFixed(0),
        score:       v.score,
        category:    v.category,
        classification: v.classification,
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Performance Tracking</h1>
                    <p className="text-sm text-gray-400">Monitor KPIs across your vendor portfolio</p>
                </div>
            </div>

            {/* Summary chips */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: 'KPIs On Track',    value: STATIC_KPIS.filter(k => (k.trend === 'up' || k.trend === 'flat') && k.actual >= k.target * 0.9).length, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                    { label: 'Needs Attention',  value: STATIC_KPIS.filter(k => k.actual < k.target * 0.9).length,  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
                    { label: 'Vendors Tracked',  value: vendors.length,                                              color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
                ].map(c => (
                    <div key={c.label} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                        <p className="text-xs font-medium text-gray-500 mb-1">{c.label}</p>
                        <p className={`text-3xl font-extrabold ${c.color}`}>{dataLoading ? '—' : c.value}</p>
                    </div>
                ))}
            </div>

            {/* KPI Metrics Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">KPI Metrics Overview</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Aggregate performance across all vendors · current period</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                {['KPI Metric','Target','Actual','Trend','Status','Progress','Insight'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {STATIC_KPIS.map((row, i) => {
                                const lowerBetter = row.metric.includes('Time') || row.metric.includes('Defect') || row.metric.includes('Lead');
                                const pct = lowerBetter
                                    ? Math.min(100, Math.round((row.target / row.actual) * 100))
                                    : Math.min(100, Math.round((row.actual / row.target) * 100));
                                const ok = lowerBetter ? row.actual <= row.target : row.actual >= row.target;
                                return (
                                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-gray-700">{row.metric}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{row.target}{row.unit}</td>
                                        <td className="px-5 py-3.5 font-semibold text-gray-800">{row.actual}{row.unit}</td>
                                        <td className="px-5 py-3.5"><TrendIcon trend={row.trend} /></td>
                                        <td className="px-5 py-3.5"><StatusPill target={row.target} actual={row.actual} lowerIsBetter={lowerBetter} /></td>
                                        <td className="px-5 py-3.5 min-w-[140px]">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-500 w-8 shrink-0">{pct}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-gray-400 max-w-[200px]">{row.note}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Per-Vendor Performance Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-800">Vendor-Level Performance</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Individual KPIs derived from vendor scores</p>
                </div>
                {dataLoading ? (
                    <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
                ) : vendorRows.length === 0 ? (
                    <div className="py-16 text-center">
                        <Clock size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400">No vendor data available yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Vendor</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                                    {VENDOR_KPI_COLS.map(h => (
                                        <th key={h} className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Class</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {vendorRows.map((v, i) => (
                                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                                        <td className="px-5 py-3.5 font-medium text-gray-800">{v.name}</td>
                                        <td className="px-5 py-3.5 text-gray-500">{v.category}</td>
                                        <td className="px-4 py-3.5 text-center text-gray-700">{v.onTime}%</td>
                                        <td className="px-4 py-3.5 text-center text-gray-700">{v.response}h</td>
                                        <td className="px-4 py-3.5 text-center text-gray-700">{v.defect}%</td>
                                        <td className="px-4 py-3.5 text-center text-gray-700">{v.fulfilment}%</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.score >= 80 ? 'bg-emerald-50 text-emerald-600' : v.score >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                                {v.score}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.classification === 'Preferred' ? 'bg-emerald-100 text-emerald-700' : v.classification === 'Regular' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'}`}>
                                                {v.classification}
                                            </span>
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
