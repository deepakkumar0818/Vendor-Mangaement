import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const AppDataContext = createContext(null);

const API = 'http://localhost:8000/api';

// ── Static analytics placeholder (no dedicated analytics endpoint yet) ────────
const BASE_ANALYTICS = {
    kpis: [
        { label: 'Total Spend YTD',   value: '—', change: 'Live from DB',        up: true, pct: 0,  color: 'indigo'  },
        { label: 'Active Vendors',    value: '—', change: 'Updates on register',  up: true, pct: 0,  color: 'emerald' },
        { label: 'Avg. Vendor Score', value: '—', change: 'Based on ratings',     up: true, pct: 0,  color: 'amber'   },
        { label: 'Cost Savings',      value: '—', change: 'From comparisons',     up: true, pct: 0,  color: 'violet'  },
    ],
    monthlySpend:  [
        { month: 'Oct', spend: 0 }, { month: 'Nov', spend: 0 },
        { month: 'Dec', spend: 0 }, { month: 'Jan', spend: 0 },
        { month: 'Feb', spend: 0 }, { month: 'Mar', spend: 0 },
    ],
    categorySpend: [],
    scoreTrend:    [],
    kpiTable: [
        { metric: 'On-Time Delivery Rate',   target: '95%',  actual: '—', pct: 0, ok: true },
        { metric: 'Quote Response Time',     target: '< 6h', actual: '—', pct: 0, ok: true },
        { metric: 'Defect / Return Rate',    target: '< 1%', actual: '—', pct: 0, ok: true },
        { metric: 'Order Fulfilment Rate',   target: '98%',  actual: '—', pct: 0, ok: true },
        { metric: 'Preferred Vendor Usage',  target: '80%',  actual: '—', pct: 0, ok: true },
        { metric: 'Cost Savings vs. Budget', target: '30%',  actual: '—', pct: 0, ok: true },
    ],
};

// ── Vendor-specific mock data (activity feed only — kept until activity API exists) ──
const MOCK_VENDOR_ACTIVITY = [];

export function AppDataProvider({ children }) {
    const { authFetch, user } = useAuth();

    const [vendors,        setVendors]        = useState([]);
    const [quotes,         setQuotes]         = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [analyticsData,  setAnalyticsData]  = useState(BASE_ANALYTICS);
    const [vendorStats,    setVendorStats]    = useState(null);
    const [vendorActivity, setVendorActivity] = useState(MOCK_VENDOR_ACTIVITY);
    const [clientStats,    setClientStats]    = useState(null);
    const [dataLoading,    setDataLoading]    = useState(false);
    const [uploadStatus,   setUploadStatus]   = useState(null);

    // Called right after login or when user is already authenticated
    const fetchAllData = useCallback(async () => {
        if (!user) return;
        setDataLoading(true);
        try {
            if (user.userRole === 'vendor') {
                // ── Vendor: load dashboard stats ──────────────────────────────
                const res = await authFetch(`${API}/vendor/dashboard`);
                if (res.ok) {
                    const data = await res.json();
                    setVendorStats(data);
                }
            } else {
                // ── Client: load dashboard + RFQs + vendor list ───────────────
                const [dashRes, rfqRes, vendorRes] = await Promise.all([
                    authFetch(`${API}/client/dashboard`),
                    authFetch(`${API}/rfq`),
                    fetch(`${API}/vendors`),           // public endpoint
                ]);

                if (dashRes.ok) {
                    const data = await dashRes.json();
                    setClientStats(data);
                    setRecentActivity(data.recentActivity || []);
                }

                if (rfqRes.ok) {
                    const data = await rfqRes.json();
                    const mapped = (data.rfqs || []).map(r => ({
                        _id:              r._id,
                        rfqNo:            r.rfqNumber,
                        vendor:           '—',
                        category:         r.category,
                        status:           r.responseCount > 0 ? 'Received' : 'Pending',
                        date:             r.createdAt?.split('T')[0] || '',
                        amount:           '—',
                        items:            1,
                        // Extra fields for VendorResponses
                        productName:      r.productName,
                        quantity:         r.quantity,
                        deliveryLocation: r.deliveryLocation,
                        deadline:         r.deadline?.split('T')[0] || '',
                        responseCount:    r.responseCount || 0,
                    }));
                    setQuotes(mapped);

                    // Build category spend chart from RFQ data
                    const catMap = {};
                    (data.rfqs || []).forEach(r => {
                        catMap[r.category] = (catMap[r.category] || 0) + 1;
                    });
                    setAnalyticsData(prev => ({
                        ...prev,
                        categorySpend: Object.entries(catMap).map(([category, spend]) => ({ category, spend })),
                    }));
                }

                if (vendorRes.ok) {
                    const vData = await vendorRes.json();
                    const count = vData.vendors?.length || 0;
                    setVendors(vData.vendors || []);
                    setAnalyticsData(prev => ({
                        ...prev,
                        kpis: prev.kpis.map((k, i) =>
                            i === 1 ? { ...k, value: String(count), pct: Math.min(count * 10, 100) } : k
                        ),
                    }));
                }
            }
        } catch (err) {
            console.error('AppData fetch error:', err);
        } finally {
            setDataLoading(false);
        }
    }, [authFetch, user]);

    const resetData = useCallback(() => {
        setVendors([]);
        setQuotes([]);
        setRecentActivity([]);
        setAnalyticsData(BASE_ANALYTICS);
        setVendorStats(null);
        setVendorActivity([]);
        setClientStats(null);
        setUploadStatus(null);
    }, []);

    // ── Vendor CRUD (used by Vendors.jsx management page) ─────────────────────
    const addVendor = useCallback(async (vendor) => {
        const newVendor = {
            ...vendor,
            _id: 'v_' + Date.now(),
            score: 0, status: 'Active', mlPredictedScore: 0, rating: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setVendors(prev => [newVendor, ...prev]);
        return newVendor;
    }, []);

    const updateVendor = useCallback(async (id, updates) => {
        setVendors(prev => prev.map(v => v._id === id ? { ...v, ...updates } : v));
    }, []);

    const deleteVendor = useCallback(async (id) => {
        setVendors(prev => prev.filter(v => v._id !== id));
    }, []);

    const uploadFile = useCallback(async (file) => {
        setUploadStatus('uploading');
        try {
            await new Promise(r => setTimeout(r, 1500));
            setUploadStatus('success');
            setTimeout(() => setUploadStatus(null), 3000);
        } catch {
            setUploadStatus('error');
            setTimeout(() => setUploadStatus(null), 3000);
        }
    }, []);

    // ── Derived dashboard stats (for backward compat with older pages) ─────────
    const dashboardStats = {
        rfqsSent:       clientStats?.rfqsSent         || quotes.length,
        quotesReceived: clientStats?.quotesReceived   || quotes.filter(q => q.status === 'Received').length,
        activeVendors:  clientStats?.vendorsAvailable || vendors.length,
        costSavings:    clientStats?.costSavings      || '—',
        openRFQs:       quotes.filter(q => q.status === 'Pending').length,
    };

    return (
        <AppDataContext.Provider value={{
            vendors, quotes, recentActivity, analyticsData,
            vendorStats, vendorActivity, clientStats, dashboardStats,
            dataLoading, uploadStatus,
            fetchAllData, resetData,
            addVendor, updateVendor, deleteVendor, uploadFile,
        }}>
            {children}
        </AppDataContext.Provider>
    );
}

export const useAppData = () => useContext(AppDataContext);
