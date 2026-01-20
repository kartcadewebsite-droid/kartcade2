import React from 'react';

const StatsSection: React.FC = () => {
    const stats = [
        { value: "50+", label: "Projects delivered" },
        { value: "100%", label: "Client satisfaction" },
        { value: "2-3", label: "Weeks delivery" }
    ];

    return (
        <section className="py-24 px-6 md:px-12 border-t border-white/10 relative z-10">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <p className="font-display text-4xl md:text-5xl text-white mb-2">{stat.value}</p>
                            <p className="text-white/40 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
