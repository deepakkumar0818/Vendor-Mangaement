import { createContext, useContext, useState, useCallback } from 'react';

const AppDataContext = createContext(null);

// ── Mock data (replace each section with real API responses) ──────────────────
const MOCK_VENDORS = [
    { _id: 'v1', name: 'AlphaTech Supplies',  category: 'Raw Materials', email: 'contact@alphatech.com',  phone: '+91 98765 43210', gstId: 'GSTIN2024A001', classification: 'Preferred', score: 94, status: 'Active',       mlPredictedScore: 92, rating: 4.5, createdAt: '2024-01-15' },
    { _id: 'v2', name: 'BlueOcean Trading',   category: 'Logistics',     email: 'info@blueocean.com',     phone: '+91 87654 32109', gstId: 'GSTIN2024B002', classification: 'Regular',   score: 76, status: 'Active',       mlPredictedScore: 78, rating: 3.8, createdAt: '2024-02-20' },
    { _id: 'v3', name: 'FastTrack Systems',   category: 'IT & Software', email: 'support@fasttrack.in',   phone: '+91 76543 21098', gstId: 'GSTIN2024C003', classification: 'Preferred', score: 88, status: 'Active',       mlPredictedScore: 90, rating: 4.2, createdAt: '2024-03-05' },
    { _id: 'v4', name: 'GreenPack Solutions', category: 'Packaging',     email: 'hello@greenpack.com',    phone: '+91 65432 10987', gstId: 'GSTIN2024D004', classification: 'Monitor',   score: 52, status: 'Under Review', mlPredictedScore: 55, rating: 2.9, createdAt: '2024-04-10' },
    { _id: 'v5', name: 'PrimeStar MRO',       category: 'MRO Supplies',  email: 'orders@primestar.co',    phone: '+91 54321 09876', gstId: 'GSTIN2024E005', classification: 'Regular',   score: 71, status: 'Active',       mlPredictedScore: 73, rating: 3.5, createdAt: '2024-05-22' },
    { _id: 'v6', name: 'MetroLogix Corp',     category: 'Logistics',     email: 'ops@metrologix.com',     phone: '+91 43210 98765', gstId: 'GSTIN2024F006', classification: 'Preferred', score: 91, status: 'Active',       mlPredictedScore: 89, rating: 4.4, createdAt: '2024-06-18' },
    { _id: 'v7', name: 'CloudBase IT',        category: 'IT & Software', email: 'hello@cloudbase.io',     phone: '+91 32109 87654', gstId: 'GSTIN2024G007', classification: 'Regular',   score: 68, status: 'Active',       mlPredictedScore: 70, rating: 3.2, createdAt: '2024-07-30' },
];

const MOCK_QUOTES = [
    { _id: 'q1', rfqNo: 'RFQ-1042', vendor: 'AlphaTech Supplies',  category: 'Raw Materials', status: 'Received', date: '2025-03-08', amount: '₹2,40,000', items: 15 },
    { _id: 'q2', rfqNo: 'RFQ-1041', vendor: 'BlueOcean Trading',   category: 'Logistics',     status: 'Pending',  date: '2025-03-07', amount: '—',          items: 8  },
    { _id: 'q3', rfqNo: 'RFQ-1040', vendor: 'FastTrack Systems',   category: 'IT & Software', status: 'Received', date: '2025-03-06', amount: '₹85,000',    items: 3  },
    { _id: 'q4', rfqNo: 'RFQ-1039', vendor: 'PrimeStar MRO',       category: 'MRO Supplies',  status: 'Declined', date: '2025-03-04', amount: '—',          items: 22 },
    { _id: 'q5', rfqNo: 'RFQ-1038', vendor: 'MetroLogix Corp',     category: 'Logistics',     status: 'Received', date: '2025-03-01', amount: '₹1,12,500',  items: 6  },
    { _id: 'q6', rfqNo: 'RFQ-1037', vendor: 'CloudBase IT',        category: 'IT & Software', status: 'Pending',  date: '2025-02-28', amount: '—',          items: 4  },
];

const MOCK_ACTIVITY = [
    { action: 'RFQ #1042 sent to 5 vendors',           time: '2 hours ago',  type: 'rfq'    },
    { action: 'AlphaTech scored 94 — marked Preferred', time: '5 hours ago',  type: 'score'  },
    { action: 'Quote received from BlueOcean Trading',  time: 'Yesterday',    type: 'quote'  },
    { action: 'New vendor "FastTrack" onboarded',       time: '2 days ago',   type: 'vendor' },
    { action: 'Price comparison report generated',      time: '3 days ago',   type: 'report' },
];

// ── Vendor-specific mock data ─────────────────────────────────────────────────
const MOCK_VENDOR_STATS = {
    rfqsReceived:         18,
    quotationsSubmitted:  14,
    ordersWon:             9,
    revenue:          '₹18.4 L',
    performanceRating:   4.6,
    conversionRate:       '64%',
    avgResponseTime:      '3.2 hrs',
    pendingRFQs:           4,
};

const MOCK_VENDOR_ACTIVITY = [
    { action: 'New RFQ #1043 received from Acme Corp',         time: '1 hour ago',   type: 'rfq'    },
    { action: 'Quotation for RFQ-1041 submitted successfully', time: '4 hours ago',  type: 'quote'  },
    { action: 'Order #ORD-2094 confirmed — delivery in 5 days',time: 'Yesterday',    type: 'vendor' },
    { action: 'RFQ #1040 from BuildMore Inc. received',        time: '2 days ago',   type: 'rfq'    },
    { action: 'Payment received for Order #ORD-2089',          time: '3 days ago',   type: 'score'  },
];

const MOCK_ANALYTICS = {
    kpis: [
        { label: 'Total Spend YTD',   value: '₹4.2 Cr',  change: '+12%',              up: true,  pct: 72, color: 'indigo'  },
        { label: 'Active Vendors',    value: '7',         change: '+2 this month',     up: true,  pct: 64, color: 'emerald' },
        { label: 'Avg. Vendor Score', value: '77 / 100',  change: '+3 pts vs last qtr',up: true,  pct: 77, color: 'amber'   },
        { label: 'Cost Savings',      value: '₹38.4 L',  change: '35% avg savings',   up: true,  pct: 55, color: 'violet'  },
    ],
    monthlySpend: [
        { month: 'Oct', spend: 28 },
        { month: 'Nov', spend: 35 },
        { month: 'Dec', spend: 22 },
        { month: 'Jan', spend: 40 },
        { month: 'Feb', spend: 31 },
        { month: 'Mar', spend: 47 },
    ],
    categorySpend: [
        { category: 'Raw Materials', spend: 142 },
        { category: 'IT & Software', spend: 89  },
        { category: 'Logistics',     spend: 67  },
        { category: 'MRO Supplies',  spend: 54  },
        { category: 'Packaging',     spend: 38  },
        { category: 'Professional',  spend: 22  },
    ],
    scoreTrend: [
        { month: 'Oct', preferred: 88, regular: 70, monitor: 45 },
        { month: 'Nov', preferred: 90, regular: 72, monitor: 48 },
        { month: 'Dec', preferred: 87, regular: 68, monitor: 42 },
        { month: 'Jan', preferred: 92, regular: 74, monitor: 50 },
        { month: 'Feb', preferred: 91, regular: 76, monitor: 47 },
        { month: 'Mar', preferred: 94, regular: 78, monitor: 43 },
    ],
    kpiTable: [
        { metric: 'On-Time Delivery Rate',   target: '95%',  actual: '91%',  pct: 91,  ok: false },
        { metric: 'Quote Response Time',     target: '< 6h', actual: '4.2h', pct: 85,  ok: true  },
        { metric: 'Defect / Return Rate',    target: '< 1%', actual: '0.8%', pct: 80,  ok: true  },
        { metric: 'Order Fulfilment Rate',   target: '98%',  actual: '96%',  pct: 96,  ok: false },
        { metric: 'Preferred Vendor Usage',  target: '80%',  actual: '87%',  pct: 87,  ok: true  },
        { metric: 'Cost Savings vs. Budget', target: '30%',  actual: '35%',  pct: 100, ok: true  },
    ],
};

// ─────────────────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }) {
    const [vendors,        setVendors]        = useState([]);
    const [quotes,         setQuotes]         = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [analyticsData,  setAnalyticsData]  = useState(null);
    const [vendorStats,    setVendorStats]    = useState(null);
    const [vendorActivity, setVendorActivity] = useState([]);
    const [dataLoading,    setDataLoading]    = useState(false);
    const [uploadStatus,   setUploadStatus]   = useState(null); // null | 'uploading' | 'success' | 'error'

    // Called right after login / on app-mount when user is already authenticated
    const fetchAllData = useCallback(async (userId) => {
        setDataLoading(true);
        try {
            // TODO: Replace with real API calls
            // const [vendorsRes, quotesRes, activityRes, analyticsRes] = await Promise.all([
            //   axios.get(`/api/vendors`,   { headers: { Authorization: `Bearer ${token}` } }),
            //   axios.get(`/api/quotes`,    { headers: { Authorization: `Bearer ${token}` } }),
            //   axios.get(`/api/activity`,  { headers: { Authorization: `Bearer ${token}` } }),
            //   axios.get(`/api/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
            // ]);
            // setVendors(vendorsRes.data);
            // setQuotes(quotesRes.data);
            // setRecentActivity(activityRes.data);
            // setAnalyticsData(analyticsRes.data);

            await new Promise(r => setTimeout(r, 800)); // simulate network latency
            setVendors(MOCK_VENDORS);
            setQuotes(MOCK_QUOTES);
            setRecentActivity(MOCK_ACTIVITY);
            setAnalyticsData(MOCK_ANALYTICS);
            setVendorStats(MOCK_VENDOR_STATS);
            setVendorActivity(MOCK_VENDOR_ACTIVITY);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setDataLoading(false);
        }
    }, []);

    // Reset all state on logout
    const resetData = useCallback(() => {
        setVendors([]);
        setQuotes([]);
        setRecentActivity([]);
        setAnalyticsData(null);
        setVendorStats(null);
        setVendorActivity([]);
        setUploadStatus(null);
    }, []);

    // ── Vendor CRUD ──────────────────────────────────────────────────────────

    const addVendor = useCallback(async (vendor) => {
        // TODO: const res = await axios.post('/api/vendors', vendor);
        const newVendor = {
            ...vendor,
            _id: 'v_' + Date.now(),
            score: 0,
            status: 'Active',
            mlPredictedScore: 0,
            rating: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setVendors(prev => [newVendor, ...prev]);
        setRecentActivity(prev => [
            { action: `New vendor "${vendor.name}" onboarded`, time: 'Just now', type: 'vendor' },
            ...prev.slice(0, 9),
        ]);
        return newVendor;
    }, []);

    const updateVendor = useCallback(async (id, updates) => {
        // TODO: await axios.put(`/api/vendors/${id}`, updates);
        setVendors(prev => prev.map(v => v._id === id ? { ...v, ...updates } : v));
    }, []);

    const deleteVendor = useCallback(async (id) => {
        // TODO: await axios.delete(`/api/vendors/${id}`);
        setVendors(prev => prev.filter(v => v._id !== id));
    }, []);

    // ── File Upload ──────────────────────────────────────────────────────────

    const uploadFile = useCallback(async (file, userId) => {
        setUploadStatus('uploading');
        try {
            // TODO:
            // const formData = new FormData();
            // formData.append('file', file);
            // formData.append('userId', userId);
            // await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            // await fetchAllData(userId); // refresh data after upload

            await new Promise(r => setTimeout(r, 1500)); // simulate upload
            setUploadStatus('success');
            setRecentActivity(prev => [
                { action: `Excel file "${file.name}" uploaded and processed`, time: 'Just now', type: 'report' },
                ...prev.slice(0, 9),
            ]);
            setTimeout(() => setUploadStatus(null), 3000);
        } catch (err) {
            setUploadStatus('error');
            setTimeout(() => setUploadStatus(null), 3000);
            throw err;
        }
    }, []);

    // ── Derived dashboard stats ──────────────────────────────────────────────
    const dashboardStats = {
        activeVendors:   vendors.filter(v => v.status === 'Active').length,
        openRFQs:        quotes.filter(q => q.status === 'Pending').length,
        quotesReceived:  quotes.filter(q => q.status === 'Received').length,
        avgScore:        vendors.length
            ? Math.round(vendors.reduce((a, v) => a + v.score, 0) / vendors.length)
            : 0,
    };

    return (
        <AppDataContext.Provider value={{
            vendors, quotes, recentActivity, analyticsData,
            vendorStats, vendorActivity,
            dataLoading, uploadStatus, dashboardStats,
            fetchAllData, resetData,
            addVendor, updateVendor, deleteVendor, uploadFile,
        }}>
            {children}
        </AppDataContext.Provider>
    );
}

export const useAppData = () => useContext(AppDataContext);
