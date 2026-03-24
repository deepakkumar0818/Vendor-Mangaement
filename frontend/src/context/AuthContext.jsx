import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const API = 'http://localhost:8000/api';

export function AuthProvider({ children }) {
    const [user,        setUser]        = useState(null);
    const [token,       setToken]       = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const _clearSession = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('vms_token');
        localStorage.removeItem('vms_user');
    };

    // Restore session from localStorage on mount — validate with server
    useEffect(() => {
        const savedToken = localStorage.getItem('vms_token');
        const savedUser  = localStorage.getItem('vms_user');
        if (savedToken && savedUser) {
            // Verify token is still valid before trusting it
            fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${savedToken}` },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Token invalid');
                    return res.json();
                })
                .then(data => {
                    setToken(savedToken);
                    setUser(data.user || JSON.parse(savedUser));
                })
                .catch(() => {
                    _clearSession();
                })
                .finally(() => setAuthLoading(false));
        } else {
            setAuthLoading(false);
        }
    }, []);

    const _saveSession = (userData, tokenValue) => {
        setUser(userData);
        setToken(tokenValue);
        localStorage.setItem('vms_token', tokenValue);
        localStorage.setItem('vms_user', JSON.stringify(userData));
    };

    // ── Register ────────────────────────────────────────────────────────────
    const register = async (name, email, password, userRole = 'client') => {
        if (!name || !email || !password) throw new Error('All fields are required');

        const res = await fetch(`${API}/auth/register`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name, email, password, userRole }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed.');

        _saveSession(data.user, data.token);
        return data;
    };

    // ── Login ────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        if (!email || !password) throw new Error('Email and password are required');

        const res = await fetch(`${API}/auth/login`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed.');

        _saveSession(data.user, data.token);
        return data;
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const logout = () => _clearSession();

    // ── Authenticated fetch helper ────────────────────────────────────────────
    const authFetch = useCallback(async (url, options = {}) => {
        const t = token || localStorage.getItem('vms_token');
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(t ? { Authorization: `Bearer ${t}` } : {}),
                ...(options.headers || {}),
            },
        });
        // Auto-logout on any 401 so stale/expired tokens don't leave users stuck
        if (res.status === 401) {
            _clearSession();
        }
        return res;
    }, [token]);

    return (
        <AuthContext.Provider value={{
            user, token, authLoading,
            isAuthenticated: !!user,
            login, register, logout, authFetch,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
