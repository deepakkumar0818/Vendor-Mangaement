import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, BarChart3, Users, FileText, Plus, Upload,
    X, TrendingUp, Award, ShoppingCart, Clock,
    CheckCircle, AlertCircle, Package, Star,
    DollarSign, Inbox, ClipboardList, Truck,
    Building2, GitCompare, Send, ArrowRight,
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

// ── VENDOR DASHBOARD ─────────────────────────────────────────────────────────
function VendorDashboard({ user }) {
    const { vendorStats, vendorActivity, dataLoading } = useAppData();

    const statCards = [
        {
            label: 'RFQs Received',
            value: dataLoading ? '—' : (vendorStats?.rfqsReceived ?? 18),
            icon: Inbox,
            border: 'border-indigo-500',
            sub: `${vendorStats?.pendingRFQs ?? 4} pending response`,
        },
        {
            label: 'Quotations Submitted',
            value: dataLoading ? '—' : (vendorStats?.quotationsSubmitted ?? 14),
            icon: ClipboardList,
            border: 'border-amber-500',
            sub: vendorStats?.conversionRate ? `${vendorStats.conversionRate} conversion rate` : '64% conversion rate',
        },
        {
            label: 'Orders Won',
            value: dataLoading ? '—' : (vendorStats?.ordersWon ?? 9),
            icon: Truck,
            border: 'border-emerald-500',
            sub: 'This quarter',
        },
        {
            label: 'Revenue',
            value: dataLoading ? '—' : (vendorStats?.revenue ?? '₹18.4 L'),
            icon: DollarSign,
            border: 'border-violet-500',
            sub: 'Total from orders',
        },
    ];

    const activity = vendorActivity.length > 0 ? vendorActivity : [
        { action: 'New RFQ #1043 received from Acme Corp',          time: '1 hour ago',  type: 'rfq'    },
        { action: 'Quotation for RFQ-1041 submitted successfully',  time: '4 hours ago', type: 'quote'  },
        { action: 'Order #ORD-2094 confirmed — delivery in 5 days', time: 'Yesterday',   type: 'vendor' },
        { action: 'RFQ #1040 from BuildMore Inc. received',         time: '2 days ago',  type: 'rfq'    },
        { action: 'Payment received for Order #ORD-2089',           time: '3 days ago',  type: 'score'  },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Welcome, {user.name.split(' ')[0]}
                        </h1>
                        <p className="text-sm text-gray-400">Vendor Portal — Supplier Dashboard</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/vendor-portal"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                    >
                        <Plus size={16} /> Add Products
                    </a>
                    <a
                        href="/quotes"
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition shadow-sm"
                    >
                        <Inbox size={16} /> View RFQs
                    </a>
                </div>
            </div>

            {/* Performance badge */}
            {!dataLoading && vendorStats && (
                <div className="mb-6 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3.5">
                    <Star size={18} className="text-indigo-500 fill-indigo-400" />
                    <p className="text-sm font-semibold text-indigo-700">
                        Your Performance Rating:&nbsp;
                        <span className="text-indigo-900">{vendorStats.performanceRating} / 5</span>
                    </p>
                    <span className="ml-auto text-xs text-indigo-500 font-medium">
                        Avg. Response Time: {vendorStats.avgResponseTime}
                    </span>
                </div>
            )}

            {/* KPI Cards */}
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
                                <TrendingUp size={12} /> <span>{s.sub}</span>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Recent Activity */}
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
                ) : (
                    <div className="space-y-2">
                        {activity.map((item, i) => {
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
        </div>
    );
}

// ── CLIENT DASHBOARD ─────────────────────────────────────────────────────────
function ClientDashboard({ user }) {
    const { dashboardStats, recentActivity, dataLoading } = useAppData();

    // Client-specific KPIs
    const statCards = [
        { label: 'RFQs Sent',         value: dataLoading ? '—' : 12,                                    icon: Send,      border: 'border-indigo-500',  sub: '3 awaiting responses'     },
        { label: 'Quotes Received',   value: dataLoading ? '—' : dashboardStats.quotesReceived,          icon: Inbox,     border: 'border-emerald-500', sub: 'From vendor responses'     },
        { label: 'Vendors Available', value: dataLoading ? '—' : dashboardStats.activeVendors,           icon: Building2, border: 'border-amber-500',   sub: 'Across all categories'     },
        { label: 'Cost Savings',      value: dataLoading ? '—' : '₹38.4 L',                             icon: DollarSign,border: 'border-violet-500',  sub: '35% avg savings achieved'  },
    ];

    const quickActions = [
        { label: 'Explore Vendors',   desc: 'Browse & discover verified suppliers',  icon: Building2,  to: '/vendor-marketplace', color: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300' },
        { label: 'Create RFQ',        desc: 'Request quotations from vendors',        icon: Send,       to: '/quotes',             color: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300' },
        { label: 'Compare Vendors',   desc: 'Side-by-side price & quality analysis',  icon: GitCompare, to: '/price-comparison',   color: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300' },
        { label: 'View Analytics',    desc: 'Spend trends & performance insights',    icon: BarChart3,  to: '/analytics',          color: 'bg-indigo-50 border-indigo-100 hover:border-indigo-300' },
    ];

    const activity = recentActivity.length > 0 ? recentActivity : [
        { action: 'RFQ #1043 sent — 4 vendors notified',    time: '1 hour ago',  type: 'rfq'    },
        { action: 'AlphaTech submitted quote for RFQ-1043', time: '3 hours ago', type: 'quote'  },
        { action: 'MetroLogix rated 4.6 ★ — Preferred',    time: 'Yesterday',   type: 'score'  },
        { action: 'Vendor comparison report generated',     time: '2 days ago',  type: 'report' },
        { action: 'New vendor FastTrack added to platform', time: '3 days ago',  type: 'vendor' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {user ? `Welcome, ${user.name.split(' ')[0]}` : 'Client Dashboard'}
                        </h1>
                        <p className="text-sm text-gray-400">Procurement & Vendor Intelligence Overview</p>
                    </div>
                </div>
                <Link
                    to="/vendor-marketplace"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-200"
                >
                    <Building2 size={16} /> Explore Vendors
                </Link>
            </div>

            {/* KPI Cards */}
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
                                <TrendingUp size={12} /> <span>{s.sub}</span>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map(a => (
                        <Link
                            key={a.label}
                            to={a.to}
                            className={`bg-white border rounded-xl p-4 flex items-start gap-3 transition-all group ${a.color}`}
                        >
                            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                                <a.icon size={17} className="text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{a.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{a.desc}</p>
                            </div>
                            <ArrowRight size={15} className="text-gray-300 group-hover:text-indigo-500 mt-1 shrink-0 ml-auto transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
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
                ) : (
                    <div className="space-y-2">
                        {activity.map((item, i) => {
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
        </div>
    );
}

// ── MAIN DASHBOARD (role router) ─────────────────────────────────────────────
export default function Dashboard() {
    const { user } = useAuth();
    if (user?.userRole === 'vendor') return <VendorDashboard user={user} />;
    return <ClientDashboard user={user} />;
}
