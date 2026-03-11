import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, Award, Users } from 'lucide-react';

function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/quotes', icon: FileText, label: 'Quotes Capture' },
        { path: '/performance', icon: BarChart3, label: 'Performance Tracking' },
        { path: '/scorecard', icon: Award, label: 'Vendor Scorecard' },
        { path: '/vendors', icon: Users, label: 'Vendors Directory' },
    ];

    return (
        <aside className={`
      fixed lg:static lg:translate-x-0 top-16 lg:top-0 left-0 w-64 h-full bg-white shadow-lg transition-all duration-300 z-40
      ${collapsed ? '-translate-x-full lg:translate-x-0' : ''}
    `}>
            <div className="p-4">
                <button onClick={() => setCollapsed(!collapsed)} className="lg:hidden mb-4 p-2 rounded bg-gray-100">
                    Menu
                </button>
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-gray-700"
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

export default Sidebar;