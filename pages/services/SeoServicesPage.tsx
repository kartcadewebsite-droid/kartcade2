import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, TrendingUp, Search, BarChart3, FileText, Globe, Target } from 'lucide-react';

const SeoServicesPage: React.FC = () => {
    const services = [
        {
            icon: <Search className="w-8 h-8" />,
            title: "Keyword Research",
            desc: "Find the exact terms your customers search for. We identify high-value keywords with real traffic potential."
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "On-Page SEO",
            desc: "Optimize your website's content, meta tags, headers, and structure for search engines."
        },
        {
            icon: <Globe className="w-8 h-8" />,
            title: "Local SEO",
            desc: "Rank in local search results. Google My Business optimization, local citations, and geo-targeted content."
        },
        {
            icon: <BarChart3 className="w-8 h-8" />,
            title: "Technical SEO",
            desc: "Site speed, mobile optimization, schema markup, and crawlability improvements."
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Content Strategy",
            desc: "Blog posts, landing pages, and content that ranks and converts."
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Link Building",
            desc: "Quality backlinks from relevant websites to boost your domain authority."
        }
    ];

    const plans = [
        {
            name: "Local SEO",
            price: "$99",
            period: "/mo",
            features: [
                "Google My Business optimization",
                "Local keyword targeting",
                "Monthly citation building",
                "Basic on-page SEO",
                "Monthly report"
            ]
        },
        {
            name: "Growth SEO",
            price: "$199",
            period: "/mo",
            featured: true,
            features: [
                "Everything in Local SEO",
                "Full website SEO audit",
                "Content optimization",
                "2 blog posts/month",
                "Competitor analysis",
                "Weekly reporting"
            ]
        },
        {
            name: "Aggressive SEO",
            price: "$399",
            period: "/mo",
            features: [
                "Everything in Growth SEO",
                "4 blog posts/month",
                "Link building campaign",
                "Technical SEO fixes",
                "Dedicated SEO manager",
                "Priority support"
            ]
        }
    ];

    return (
        <div className="bg-white min-h-screen">

            {/* Hero */}
            <section className="pt-40 pb-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <span className="font-mono text-white/40 uppercase tracking-widest text-sm mb-6 block">Search Engine Optimization</span>
                    <h1 className="font-display text-5xl md:text-7xl font-bold uppercase leading-none mb-8">
                        SEO Services
                    </h1>
                    <p className="font-sans text-xl text-white/60 max-w-2xl leading-relaxed mb-10">
                        Get found on Google. Our SEO services help businesses rank higher in search results, drive organic traffic, and generate more leads. No tricks, just proven strategies that work.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center gap-2 bg-white text-black px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-white/90 transition-colors group"
                        >
                            Get SEO Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/pricing"
                            className="inline-flex items-center justify-center px-10 py-5 rounded-full border border-white/20 font-display uppercase tracking-widest font-bold hover:bg-white/10 transition-colors"
                        >
                            View Plans
                        </Link>
                    </div>
                </div>
            </section>

            {/* What We Do */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl uppercase mb-4 text-black">What We Do</h2>
                        <p className="text-black/60 text-lg">Comprehensive SEO services to boost your visibility</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, i) => (
                            <div key={i} className="p-8 border border-black/10 rounded-2xl hover:border-black/30 transition-colors">
                                <div className="text-black mb-6">{service.icon}</div>
                                <h3 className="font-display text-xl uppercase mb-3">{service.title}</h3>
                                <p className="text-black/60">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 px-6 md:px-12 bg-black text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-4xl md:text-5xl uppercase mb-4">SEO Plans</h2>
                        <p className="text-white/60 text-lg">Choose the right level of SEO for your business</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`p-8 rounded-2xl ${plan.featured ? 'bg-white text-black' : 'border border-white/20'}`}
                            >
                                <h3 className={`font-display text-2xl uppercase mb-2 ${plan.featured ? 'text-black' : 'text-white'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className={`font-display text-4xl font-bold ${plan.featured ? 'text-black' : 'text-white'}`}>{plan.price}</span>
                                    <span className={plan.featured ? 'text-black/40' : 'text-white/40'}>{plan.period}</span>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className={`flex items-center gap-2 text-sm ${plan.featured ? 'text-black/80' : 'text-white/80'}`}>
                                            <Check className={`w-4 h-4 ${plan.featured ? 'text-black' : 'text-white'}`} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/contact"
                                    className={`block w-full py-4 rounded-full font-display uppercase text-sm tracking-widest font-bold text-center transition-colors ${plan.featured
                                            ? 'bg-black text-white hover:bg-black/80'
                                            : 'border border-white/20 text-white hover:bg-white/10'
                                        }`}
                                >
                                    Get Started
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why SEO Matters */}
            <section className="py-20 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-8 text-black text-center">Why SEO Matters</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="font-display text-6xl font-bold text-black mb-4">68%</div>
                            <p className="text-black/60">of online experiences begin with a search engine</p>
                        </div>
                        <div>
                            <div className="font-display text-6xl font-bold text-black mb-4">53%</div>
                            <p className="text-black/60">of website traffic comes from organic search</p>
                        </div>
                        <div>
                            <div className="font-display text-6xl font-bold text-black mb-4">75%</div>
                            <p className="text-black/60">of users never scroll past the first page</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 md:px-12 bg-black text-white text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="font-display text-4xl md:text-5xl uppercase mb-6">Ready to Rank Higher?</h2>
                    <p className="text-white/60 text-lg mb-10">
                        Get a free SEO audit and discover how we can help your business get found on Google.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center justify-center gap-2 bg-white text-black px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-white/90 transition-colors group"
                    >
                        Get Free SEO Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default SeoServicesPage;
