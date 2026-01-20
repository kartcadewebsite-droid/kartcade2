import React from 'react';

const testimonials = [
    {
        quote: "They delivered exactly what we needed. Clean, fast, and it works.",
        name: "John Smith",
        company: "Fashion Brand Co. - CEO"
    },
    {
        quote: "Professional team. Great communication. Our site looks amazing.",
        name: "Sarah Johnson",
        company: "Urban Builders - Marketing Director"
    }
];

const TestimonialsSection: React.FC = () => {
    return (
        <section className="bg-white py-32 px-6 md:px-12 border-t border-black/10">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-20">
                    <p className="text-black/40 text-sm mb-4">Testimonials</p>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-black">
                        What clients say
                    </h2>
                </div>

                {/* Quotes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {testimonials.map((t, i) => (
                        <div key={i}>
                            <p className="font-sans text-xl md:text-2xl text-black leading-relaxed mb-8">
                                "{t.quote}"
                            </p>
                            <div>
                                <p className="text-black font-medium">{t.name}</p>
                                <p className="text-black/40 text-sm">{t.company}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
