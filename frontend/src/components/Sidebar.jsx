import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, FileText, BarChart3, Award, Users,
    GitCompare, LineChart, Star, ChevronLeft, ChevronRight,
    ShoppingCart, Store, Package, Truck, ClipboardList,
    Building2, Inbox, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CLIENT_MENU = [
    { path: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard'          },
    { path: '/vendor-marketplace',  icon: Building2,       label: 'Vendor Marketplace' },
    { path: '/quotes',              icon: FileText,        label: 'RFQ Requests'       },
    { path: '/vendor-responses',    icon: Inbox,           label: 'Vendor Responses'   },
    { path: '/price-comparison',    icon: GitCompare,      label: 'Vendor Comparison'  },
    { path: '/analytics',           icon: LineChart,       label: 'Analytics'          },
    { path: '/reviews',             icon: MessageSquare,   label: 'Reviews'            },
];

const VENDOR_MENU = [
    { path: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard'            },
    { path: '/vendor-portal',      icon: Package,         label: 'My Products'          },
    { path: '/quotes',             icon: ClipboardList,   label: 'RFQ Inbox'            },
    { path: '/performance',        icon: BarChart3,       label: 'Performance'          },
    { path: '/analytics',          icon: LineChart,       label: 'Analytics'            },
];

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    const menuItems = user?.userRole === 'vendor' ? VENDOR_MENU : CLIENT_MENU;

    return (
        <aside className={`
            shrink-0 h-[calc(100vh-4.5rem)] sticky top-[72px]
            bg-white shadow-lg border-r border-gray-200
            transition-all duration-300
            ${collapsed ? 'w-16' : 'w-60'}
        `}>
            <div className="flex flex-col h-full">
                {/* Role badge */}
                {!collapsed && user && (
                    <div className="px-4 pt-3 pb-2">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            user.userRole === 'vendor'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                            {user.userRole === 'vendor' ? <Store size={11} /> : <Users size={11} />}
                            {user.userRole === 'vendor' ? 'Vendor Portal' : 'Client Portal'}
                        </span>
                    </div>
                )}

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
