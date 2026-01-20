import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Palette, FileText, CreditCard, Package, Instagram, Layers } from 'lucide-react';

const BrandingServicesPage: React.FC = () => {
    const services = [
        { icon: <Palette className="w-8 h-8" />, title: "Logo Design", desc: "Memorable, versatile logos that represent your brand perfectly." },
        { icon: <Layers className="w-8 h-8" />, title: "Brand Identity", desc: "Complete visual system including colors, typography, and guidelines." },
        { icon: <CreditCard className="w-8 h-8" />, title: "Business Cards", desc: "Professional business cards that make a lasting impression." },
        { icon: <FileText className="w-8 h-8" />, title: "Stationery", desc: "Letterheads, envelopes, and branded documents." },
        { icon: <Instagram className="w-8 h-8" />, title: "Social Templates", desc: "Branded templates for consistent social media presence." },
        { icon: <Package className="w-8 h-8" />, title: "Packaging", desc: "Product packaging that stands out on shelves and online." }
    ];

    const packages = [
        { name: "Logo Only", price: "$149", features: ["3 concepts", "Unlimited revisions", "All file formats", "Brand colors"] },
        { name: "Logo + Brand Kit", price: "$249", featured: true, features: ["Logo design", "Color palette", "Typography", "Brand guidelines PDF", "Social profile kit"] },
        { name: "Full Identity", price: "$499", features: ["Everything in Brand Kit", "Business cards", "Letterhead", "Social templates (10)", "Packaging mockups"] }
    ];

    return (
        <div className="bg-white min-h-screen">
            <section className="pt-40 pb-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-6 block">Brand Identity</span>
                    <h1 className="font-display text-5xl md:text-7xl font-bold uppercase leading-none mb-8">Branding &<br />Design Services</h1>
                    <p className="font-sans text-xl text-white/60 max-w-2xl leading-relaxed mb-10">Professional branding and logo design that makes your business memorable. We create complete brand identities that stand out and connect with your audience.</p>
                    <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-black px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-white/90 transition-colors group">
                        Get a Quote <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((s, i) => (
                        <div key={i} className="p-8 border border-black/10 rounded-2xl hover:border-black/30 transition-colors">
                            <div className="text-black mb-6">{s.icon}</div>
                            <h3 className="font-display text-xl uppercase mb-3">{s.title}</h3>
                            <p className="text-black/60">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-16 text-center">Branding Packages</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {packages.map((pkg, i) => (
                            <div key={i} className={`p-8 rounded-2xl ${pkg.featured ? 'bg-white text-black' : 'border border-white/20'}`}>
                                <h3 className={`font-display text-2xl uppercase mb-2 ${pkg.featured ? 'text-black' : 'text-white'}`}>{pkg.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className={`font-display text-4xl font-bold ${pkg.featured ? 'text-black' : 'text-white'}`}>{pkg.price}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {pkg.features.map((f, j) => (
                                        <li key={j} className={`flex items-center gap-2 text-sm ${pkg.featured ? 'text-black/80' : 'text-white/80'}`}>
                                            <Check className={`w-4 h-4 ${pkg.featured ? 'text-black' : 'text-white'}`} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/contact" className={`block w-full py-4 rounded-full font-display uppercase text-sm tracking-widest font-bold text-center transition-colors ${pkg.featured ? 'bg-black text-white hover:bg-black/80' : 'border border-white/20 hover:bg-white/10'}`}>Get Started</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-6 text-black">Ready to Build Your Brand?</h2>
                    <p className="text-black/60 text-lg mb-10">Let's create a brand identity that sets you apart from the competition.</p>
                    <Link to="/contact" className="inline-flex items-center gap-2 bg-black text-white px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-black/80 transition-colors group">
                        Start Your Project <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default BrandingServicesPage;
