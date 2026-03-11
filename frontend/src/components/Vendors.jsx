export default function VendorsTable({ vendors = [] }) {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Vendors Directory</h1>
            <div className="bg-white rounded-xl p-6 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Vendor</th>
                            <th className="text-left p-3">Category</th>
                            <th className="text-left p-3">Score</th>
                            <th className="text-left p-3">Classification</th>
                            <th className="text-left p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendors.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-400">No vendors yet.</td>
                            </tr>
                        ) : vendors.map(v => (
                            <tr key={v.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{v.name}</td>
                                <td className="p-3">{v.category}</td>
                                <td className="p-3">{v.score}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${v.classification === 'Preferred' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {v.classification}
                                    </span>
                                </td>
                                <td className="p-3"><button className="text-blue-600 hover:underline">View Details</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
