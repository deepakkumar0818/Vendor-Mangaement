import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, Award, Users, GitCompare, LineChart, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const menuItems = [
    { path: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/vendors',            icon: Users,           label: 'Vendor Master' },
    { path: '/quotes',             icon: FileText,        label: 'RFQ & Quotes' },
    { path: '/price-comparison',   icon: GitCompare,      label: 'Price Comparison' },
    { path: '/performance',        icon: BarChart3,       label: 'Performance' },
    { path: '/scorecard',          icon: Award,           label: 'Scorecards' },
    { path: '/preferred-vendors',  icon: Star,            label: 'Preferred Vendors' },
    { path: '/analytics',          icon: LineChart,       label: 'Analytics' },
];

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside className={`
            shrink-0 h-[calc(100vh-4.5rem)] sticky top-[72px]
            bg-white shadow-lg border-r border-gray-200
            transition-all duration-300
            ${collapsed ? 'w-16' : 'w-60'}
        `}>
            <div className="flex flex-col h-full">
                <div className="flex justify-end p-2 border-b border-gray-100">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-2">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        title={collapsed ? item.label : ''}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                                            ${active
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        <item.icon size={20} className="shrink-0" />
                                        {!collapsed && <span className="text-sm">{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;
