import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('vms_token');
        const savedUser = localStorage.getItem('vms_user');
        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('vms_token');
                localStorage.removeItem('vms_user');
            }
        }
        setAuthLoading(false);
    }, []);

    const login = async (email, password, userRole = 'client') => {
        if (!email || !password) throw new Error('Email and password are required');
        await new Promise(r => setTimeout(r, 700));

        const mockUser = {
            _id: 'u_' + email.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            email,
            avatar: email.charAt(0).toUpperCase(),
            userRole,
            role: userRole === 'vendor' ? 'Vendor Partner' : 'Procurement Manager',
            createdAt: new Date().toISOString(),
        };
        const mockToken = 'vms_jwt_' + Date.now();

        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('vms_token', mockToken);
        localStorage.setItem('vms_user', JSON.stringify(mockUser));
        return { user: mockUser, token: mockToken };
    };

    const register = async (name, email, password, userRole = 'client') => {
        if (!name || !email || !password) throw new Error('All fields are required');
        await new Promise(r => setTimeout(r, 900));

        const mockUser = {
            _id: 'u_' + email.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            name,
            email,
            avatar: name.charAt(0).toUpperCase(),
            userRole,
            role: userRole === 'vendor' ? 'Vendor Partner' : 'Procurement Manager',
            createdAt: new Date().toISOString(),
        };
        const mockToken = 'vms_jwt_' + Date.now();

        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('vms_token', mockToken);
        localStorage.setItem('vms_user', JSON.stringify(mockUser));
        return { user: mockUser, token: mockToken };
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('vms_token');
        localStorage.removeItem('vms_user');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            authLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
