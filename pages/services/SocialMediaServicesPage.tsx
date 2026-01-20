import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Instagram, Share2, TrendingUp, Video, Calendar, BarChart3 } from 'lucide-react';

const SocialMediaServicesPage: React.FC = () => {
    const services = [
        { icon: <Calendar className="w-8 h-8" />, title: "Content Planning", desc: "Strategic content calendars aligned with your business goals." },
        { icon: <Instagram className="w-8 h-8" />, title: "Social Posts", desc: "Engaging graphics and captions for Instagram, Facebook, LinkedIn." },
        { icon: <Video className="w-8 h-8" />, title: "Reels & Video", desc: "Short-form video content that drives engagement and reach." },
        { icon: <Share2 className="w-8 h-8" />, title: "Community", desc: "Respond to comments, DMs, and build your online community." },
        { icon: <TrendingUp className="w-8 h-8" />, title: "Paid Ads", desc: "Meta, Google, YouTube ads managed for maximum ROI." },
        { icon: <BarChart3 className="w-8 h-8" />, title: "Analytics", desc: "Monthly reports with insights and recommendations." }
    ];

    const plans = [
        { name: "Starter", price: "$99", period: "/mo", features: ["12 posts/month", "2 platforms", "Basic graphics", "Monthly report"] },
        { name: "Growth", price: "$199", period: "/mo", featured: true, features: ["20 posts/month", "4 reels/month", "3 platforms", "Story content", "Weekly reporting"] },
        { name: "Pro", price: "$349", period: "/mo", features: ["30 posts/month", "8 reels/month", "All platforms", "Community management", "Ad management"] }
    ];

    return (
        <div className="bg-white min-h-screen">
            <section className="pt-40 pb-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-6 block">Social Media</span>
                    <h1 className="font-display text-5xl md:text-7xl font-bold uppercase leading-none mb-8">Social Media<br />Management</h1>
                    <p className="font-sans text-xl text-white/60 max-w-2xl leading-relaxed mb-10">Grow your online presence with strategic social media management. We handle content creation, posting, engagement, and paid advertising so you can focus on running your business.</p>
                    <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-black px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-white/90 transition-colors group">
                        Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-16 text-center">Management Plans</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <div key={i} className={`p-8 rounded-2xl ${plan.featured ? 'bg-white text-black' : 'border border-white/20'}`}>
                                <h3 className={`font-display text-2xl uppercase mb-2 ${plan.featured ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className={`font-display text-4xl font-bold ${plan.featured ? 'text-black' : 'text-white'}`}>{plan.price}</span>
                                    <span className={plan.featured ? 'text-black/40' : 'text-white/40'}>{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className={`flex items-center gap-2 text-sm ${plan.featured ? 'text-black/80' : 'text-white/80'}`}>
                                            <Check className={`w-4 h-4 ${plan.featured ? 'text-black' : 'text-white'}`} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/contact" className={`block w-full py-4 rounded-full font-display uppercase text-sm tracking-widest font-bold text-center transition-colors ${plan.featured ? 'bg-black text-white hover:bg-black/80' : 'border border-white/20 hover:bg-white/10'}`}>Get Started</Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 md:px-12 text-center">
                <h2 className="font-display text-4xl md:text-5xl uppercase mb-6 text-black">Ready to Grow Your Social Presence?</h2>
                <p className="text-black/60 text-lg mb-10 max-w-2xl mx-auto">Let's build a social media strategy that connects with your audience and drives results.</p>
                <Link to="/contact" className="inline-flex items-center gap-2 bg-black text-white px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-black/80 transition-colors group">
                    Start Today <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </section>
        </div>
    );
};

export default SocialMediaServicesPage;
