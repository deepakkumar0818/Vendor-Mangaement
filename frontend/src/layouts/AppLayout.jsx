import { useEffect } from 'react';
import Sidebar       from '../components/Sidebar';
import { useAuth }    from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';

export default function AppLayout({ children }) {
    const { user }                          = useAuth();
    const { fetchAllData, vendors, dataLoading } = useAppData();

    // Auto-fetch user data when layout mounts (covers page refresh case)
    useEffect(() => {
        if (user && !dataLoading) {
            fetchAllData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userRole]);

    return (
        <div className="flex min-h-screen pt-[72px]">
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
                {children}
            </main>
        </div>
    );
}
