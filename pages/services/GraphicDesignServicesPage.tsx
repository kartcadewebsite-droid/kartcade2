import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Image, FileText, Presentation, Instagram, Package, Video } from 'lucide-react';

const GraphicDesignServicesPage: React.FC = () => {
    const services = [
        { icon: <Image className="w-8 h-8" />, title: "Digital Graphics", desc: "Social media graphics, banners, ads, and web visuals." },
        { icon: <FileText className="w-8 h-8" />, title: "Print Design", desc: "Flyers, posters, brochures, and marketing materials." },
        { icon: <Presentation className="w-8 h-8" />, title: "Presentations", desc: "Professional slide decks for pitches and meetings." },
        { icon: <Instagram className="w-8 h-8" />, title: "Social Templates", desc: "Branded templates for consistent social presence." },
        { icon: <Package className="w-8 h-8" />, title: "Packaging", desc: "Product packaging and label design." },
        { icon: <Video className="w-8 h-8" />, title: "Motion Graphics", desc: "Animated graphics and video intros." }
    ];

    const pricing = [
        { item: "Social media graphic", price: "$25" },
        { item: "Flyer / Poster design", price: "$49" },
        { item: "Brochure (tri-fold)", price: "$79" },
        { item: "Presentation (10 slides)", price: "$99" },
        { item: "Infographic", price: "$49" },
        { item: "Banner / Billboard", price: "$59" },
        { item: "Packaging design", price: "$149+" },
        { item: "Video editing (short)", price: "$29" },
        { item: "Video editing (long)", price: "$99" },
        { item: "Motion graphics", price: "$99+" }
    ];

    return (
        <div className="bg-white min-h-screen">
            <section className="pt-40 pb-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-6 block">Creative Design</span>
                    <h1 className="font-display text-5xl md:text-7xl font-bold uppercase leading-none mb-8">Graphic Design<br />Services</h1>
                    <p className="font-sans text-xl text-white/60 max-w-2xl leading-relaxed mb-10">Professional graphic design for your business. From social media graphics to print materials, we create visuals that communicate your message and strengthen your brand.</p>
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
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-16 text-center">Pricing</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {pricing.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-6 border border-white/10 rounded-xl">
                                <span className="text-white/80">{item.item}</span>
                                <span className="font-display font-bold text-lg">{item.price}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-white/40 text-center mt-8">Bulk discounts available. Contact us for custom quotes.</p>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 text-center">
                <h2 className="font-display text-4xl md:text-5xl uppercase mb-6 text-black">Need Design Work?</h2>
                <p className="text-black/60 text-lg mb-10 max-w-2xl mx-auto">Tell us about your project and we'll create visuals that stand out.</p>
                <Link to="/contact" className="inline-flex items-center gap-2 bg-black text-white px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-black/80 transition-colors group">
                    Start Your Project <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </section>
        </div>
    );
};

export default GraphicDesignServicesPage;
