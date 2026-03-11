// src/pages/Features.jsx
export default function Features() {
    return (
        <div className="container mx-auto px-5 py-16">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Key Features of Our Platform</h1>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
                Everything you need to make confident software decisions
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: "Side-by-Side Comparison", desc: "Compare up to 5 tools at once — features, pricing, reviews, integrations" },
                    { title: "Verified User Reviews", desc: "1,200+ authentic reviews with screenshots and detailed ratings" },
                    { title: "Advanced Filters", desc: "Filter by price, deployment (cloud/on-premise), industry, size..." },
                    { title: "Vendor Profiles", desc: "Detailed info, pricing tables, alternatives, pros & cons" },
                    { title: "AI Recommendations", desc: "Get personalized suggestions based on your needs (coming soon)" },
                    { title: "Write & Earn", desc: "Share your experience and earn credits or rewards" },
                ].map((f, i) => (
                    <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                        <h3 className="text-2xl font-bold mb-4 text-indigo-600">{f.title}</h3>
                        <p className="text-gray-600">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}