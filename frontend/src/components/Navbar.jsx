import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, LayoutDashboard, User } from 'lucide-react';
import { useAuth }    from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';

const navLinks = [
    { label: 'Features',  path: '/features'  },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Vendors',   path: '/vendors'   },
    { label: 'Contact',   path: '/contact'   },
];

export default function Navbar() {
    const [scrolled,     setScrolled]     = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef  = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const { isAuthenticated, user, logout } = useAuth();
    const { resetData }                     = useAppData();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        resetData();
        setUserMenuOpen(false);
        navigate('/');
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <nav className={`
                pointer-events-auto flex items-center justify-between
                transition-all duration-500 ease-in-out
                ${scrolled
                    ? 'mt-3 px-4 py-2 rounded-full bg-indigo-600/90 backdrop-blur-xl shadow-2xl shadow-indigo-400/40 w-auto gap-2'
                    : 'mt-4 px-6 py-3 rounded-full bg-white shadow-lg shadow-gray-200/80 border border-gray-100 w-[90%] max-w-5xl gap-6'
                }
            `}>
                {/* Logo */}
                <Link
                    to="/"
                    className={`font-extrabold tracking-tight transition-all duration-500 shrink-0
                        ${scrolled ? 'text-lg text-white' : 'text-xl text-indigo-600'}
                    `}
                >
                    VMS.
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-0.5">
                    {navLinks.map(link => {
                        const active = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`
                                    rounded-full font-medium transition-all duration-300
                                    ${scrolled
                                        ? `text-xs px-3 py-1.5 ${active ? 'bg-white/25 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'}`
                                        : `text-sm px-4 py-2   ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                                    }
                                `}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>

                {/* Right actions */}
                <div className={`flex items-center transition-all duration-300 ${scrolled ? 'gap-2' : 'gap-3'}`}>

                    {isAuthenticated ? (
                        /* ── Logged-in user menu ── */
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center gap-2 rounded-full font-semibold transition-all duration-300
                                    ${scrolled
                                        ? 'bg-white/20 text-white text-xs px-3 py-1.5 hover:bg-white/30'
                                        : 'bg-indigo-50 text-indigo-700 text-sm px-3 py-2 hover:bg-indigo-100'
                                    }`}
                            >
                                {/* Avatar circle */}
                                <span className={`flex items-center justify-center rounded-full bg-indigo-600 text-white font-bold shrink-0
                                    ${scrolled ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs'}`}>
                                    {user?.avatar || 'U'}
                                </span>
                                <span className="max-w-[90px] truncate hidden sm:block">
                                    {user?.name?.split(' ')[0] || 'User'}
                                </span>
                                <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                    {/* User info */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                {user?.avatar || 'U'}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to="/dashboard"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <LayoutDashboard size={14} className="text-gray-400" />
                                        My Dashboard
                                    </Link>
                                    <Link
                                        to="/vendors"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <User size={14} className="text-gray-400" />
                                        My Vendors
                                    </Link>

                                    <div className="border-t border-gray-100 mt-1 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 w-full text-left transition-colors"
                                        >
                                            <LogOut size={14} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ── Guest buttons ── */
                        <>
                            <Link
                                to="/login"
                                className={`font-medium transition-all duration-300
                                    ${scrolled ? 'text-xs text-white/80 hover:text-white' : 'text-sm text-gray-600 hover:text-gray-900'}`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/login"
                                className={`rounded-full font-semibold transition-all duration-300
                                    ${scrolled
                                        ? 'text-xs px-3.5 py-1.5 bg-white text-indigo-600 hover:bg-indigo-50 shadow-md'
                                        : 'text-sm px-5 py-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
                                    }`}
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
}
