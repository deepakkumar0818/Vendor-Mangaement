import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ShieldCheck, Store, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';

export default function LoginPage() {
    const [tab,          setTab]          = useState('login');
    const [role,         setRole]         = useState('client');
    const [form,         setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState('');

    const { login, register } = useAuth();
    const { fetchAllData }    = useAppData();
    const navigate            = useNavigate();

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const switchTab = t => { setTab(t); setError(''); setForm({ name: '', email: '', password: '', confirm: '' }); };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        if (tab === 'register' && form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (tab === 'register' && form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            // On login, backend auto-returns role — no need to pass it
            const result = tab === 'login'
                ? await login(form.email, form.password)
                : await register(form.name, form.email, form.password, role);
            await fetchAllData();
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Logo + tagline */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <span className="text-4xl font-extrabold text-indigo-600 tracking-tight">VMS.</span>
                    </Link>
                    <p className="text-gray-500 text-sm mt-1.5 font-medium">Vendor Management System</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* Tab switcher */}
                    <div className="flex border-b border-gray-100">
                        {[
                            { key: 'login',    label: 'Sign In'        },
                            { key: 'register', label: 'Create Account' },
                        ].map(t => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => switchTab(t.key)}
                                className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                                    tab === t.key
                                        ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/40'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-5">

                        {/* Role selector — only on register tab; login returns role from backend */}
                        {tab === 'register' && <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('client')}
                                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                        role === 'client'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    <Building2 size={17} />
                                    Client / Buyer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('vendor')}
                                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                                        role === 'vendor'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                                >
                                    <Store size={17} />
                                    Vendor / Supplier
                                </button>
                            </div>
                        </div>}

                        {/* Name field (register only) */}
                        {tab === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-gray-300 transition"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    autoComplete="email"
                                    placeholder="you@company.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-gray-300 transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                {tab === 'login' && (
                                    <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot password?</a>
                                )}
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-gray-300 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password (register only) */}
                        {tab === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input
                                        name="confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.confirm}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 placeholder-gray-300 transition"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error banner */}
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                <span className="w-4 h-4 shrink-0 text-rose-500">✕</span>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {tab === 'login' ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>

                        {/* Switch tab link */}
                        <p className="text-center text-sm text-gray-500">
                            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                type="button"
                                onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                                className="text-indigo-600 font-semibold hover:underline"
                            >
                                {tab === 'login' ? 'Create one' : 'Sign in'}
                            </button>
                        </p>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
                    <ShieldCheck size={13} />
                    <span>Secured with JWT authentication · Data isolated per user</span>
                </div>

                <p className="text-center text-xs text-gray-400 mt-3">
                    <Link to="/" className="hover:text-indigo-600 transition-colors">← Back to Home</Link>
                </p>
            </div>
        </div>
    );
}
