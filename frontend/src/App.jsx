import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import Navbar from './components/Navbar';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Features from './pages/Features';
import Contact from './pages/Contact';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Quotes from './pages/Quotes';
import PriceComparison from './pages/PriceComparison';
import Performance from './pages/Performance';
import Scorecard from './pages/Scorecard';
import PreferredVendors from './pages/PreferredVendors';
import Analytics from './pages/Analytics';
import SmartQuote from './pages/SmartQuote';
import VendorPortal from './pages/VendorPortal';
import VendorRFQInbox from './pages/VendorRFQInbox';
import VendorMarketplace from './pages/VendorMarketplace';
import VendorResponses from './pages/VendorResponses';
import Reviews from './pages/Reviews';

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
                {/* ── Public pages ── */}
                <Route path="/" element={<main className="pt-[72px]"><Home /></main>} />
                <Route path="/features" element={<main className="pt-[72px]"><Features /></main>} />
                <Route path="/contact" element={<main className="pt-[72px]"><Contact /></main>} />

                {/* ── Auth page (redirect to dashboard if already logged in) ── */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
                />

                {/* ── Protected app pages ── */}
                <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
                <Route path="/vendors" element={<ProtectedRoute><AppLayout><Vendors /></AppLayout></ProtectedRoute>} />
                <Route path="/quotes" element={<ProtectedRoute><AppLayout><Quotes /></AppLayout></ProtectedRoute>} />
                <Route path="/price-comparison" element={<ProtectedRoute><AppLayout><PriceComparison /></AppLayout></ProtectedRoute>} />
                <Route path="/performance" element={<ProtectedRoute><AppLayout><Performance /></AppLayout></ProtectedRoute>} />
                <Route path="/scorecard" element={<ProtectedRoute><AppLayout><Scorecard /></AppLayout></ProtectedRoute>} />
                <Route path="/preferred-vendors" element={<ProtectedRoute><AppLayout><PreferredVendors /></AppLayout></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
                <Route path="/smart-quote" element={<ProtectedRoute><AppLayout><SmartQuote /></AppLayout></ProtectedRoute>} />
                <Route path="/vendor-portal" element={<ProtectedRoute><AppLayout><VendorPortal /></AppLayout></ProtectedRoute>} />
                <Route path="/rfq-inbox" element={<ProtectedRoute><AppLayout><VendorRFQInbox /></AppLayout></ProtectedRoute>} />
                <Route path="/vendor-marketplace" element={<ProtectedRoute><AppLayout><VendorMarketplace /></AppLayout></ProtectedRoute>} />
                <Route path="/vendor-responses" element={<ProtectedRoute><AppLayout><VendorResponses /></AppLayout></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute><AppLayout><Reviews /></AppLayout></ProtectedRoute>} />

                <Route path="*" element={<div className="pt-16 p-20 text-center text-2xl text-gray-400">404 – Page not found</div>} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppDataProvider>
                    <AppRoutes />
                </AppDataProvider>
            </AuthProvider>
        </Router>
    );
}


export default App;
