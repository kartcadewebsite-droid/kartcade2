import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send, Check, AlertCircle, Phone, Mail, MapPin, Clock } from 'lucide-react';
import siteConfig from '../config/site';

const Contact: React.FC = () => {
    useEffect(() => {
        document.title = "Contact Us | Kartcade Racing Simulator Lounge";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'Contact Kartcade - Oregon\'s premier racing simulator lounge. Call us at 503-490-9194 or visit us in West Linn.');
        }
        return () => {
            document.title = "Kartcade | Racing & Flight Simulator Lounge";
        };
    }, []);

    const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState('submitting');

        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFormState('success');
    };

    return (
        <div className="bg-[#0A0A0A] min-h-screen">
            <div className="min-h-screen flex flex-col lg:flex-row">

                {/* Left Side: Info */}
                <div className="w-full lg:w-5/12 bg-[#141414] text-white p-8 md:p-12 lg:p-16 xl:p-24 flex flex-col justify-between relative overflow-hidden pt-32">

                    <div className="relative z-10">
                        <span className="text-[#2D9E49] text-xs font-bold uppercase tracking-widest mb-4 block">Get In Touch</span>
                        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl uppercase leading-none mb-8">
                            Let's<br /><span className="text-[#D42428]">Talk.</span>
                        </h1>
                        <p className="font-sans text-white/60 text-lg leading-relaxed max-w-sm">
                            Have questions about our simulators, booking, or events?
                            We're here to help. Give us a call or send us a message.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-8 mt-12">
                        <div className="flex items-start gap-4">
                            <Phone className="w-6 h-6 text-[#2D9E49] mt-1" />
                            <div>
                                <span className="block font-mono text-xs uppercase text-white/40 mb-1">Phone / Text</span>
                                <a href={`tel:${siteConfig.phone}`} className="font-display text-xl md:text-2xl hover:text-[#2D9E49] transition-colors">
                                    {siteConfig.phone}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Mail className="w-6 h-6 text-[#2D9E49] mt-1" />
                            <div>
                                <span className="block font-mono text-xs uppercase text-white/40 mb-1">Email</span>
                                <a href={`mailto:${siteConfig.email}`} className="font-display text-lg md:text-xl hover:text-[#2D9E49] transition-colors break-all">
                                    {siteConfig.email}
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="w-6 h-6 text-[#D42428] mt-1" />
                            <div>
                                <span className="block font-mono text-xs uppercase text-white/40 mb-1">Location</span>
                                <a
                                    href={siteConfig.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-sans text-lg hover:text-[#2D9E49] transition-colors"
                                >
                                    West Linn, Oregon
                                </a>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Clock className="w-6 h-6 text-[#2D9E49] mt-1" />
                            <div>
                                <span className="block font-mono text-xs uppercase text-white/40 mb-1">Hours</span>
                                <p className="font-sans text-lg">Call for availability</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-12 space-y-4">
                        <Link
                            to="/book"
                            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors"
                        >
                            Book a Session <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href={siteConfig.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                        >
                            <MapPin className="w-5 h-5" /> Get Directions
                        </a>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full lg:w-7/12 bg-[#0A0A0A] p-8 md:p-12 lg:p-16 xl:p-24 flex items-center pt-32 lg:pt-24">
                    {formState === 'success' ? (
                        <div className="flex flex-col items-center justify-center w-full text-white">
                            <div className="w-20 h-20 bg-[#2D9E49] rounded-full flex items-center justify-center mb-6">
                                <Check className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="font-display text-3xl uppercase mb-4">Message Sent!</h2>
                            <p className="font-sans text-white/60 text-center max-w-md mb-8">
                                Thank you for contacting Kartcade. We'll get back to you as soon as possible.
                            </p>
                            <a
                                href={`tel:${siteConfig.phone}`}
                                className="flex items-center gap-3 text-[#2D9E49] hover:underline"
                            >
                                <Phone className="w-5 h-5" /> Need immediate help? Call us
                            </a>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="w-full max-w-xl">
                            <h2 className="font-display text-3xl md:text-4xl uppercase text-white mb-8">Send a Message</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Your Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors"
                                        placeholder="John Smith"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors"
                                            placeholder="john@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors"
                                            placeholder="(555) 555-5555"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Subject</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors"
                                    >
                                        <option>General Inquiry</option>
                                        <option>Booking Question</option>
                                        <option>Birthday Party</option>
                                        <option>Corporate Event</option>
                                        <option>Gift Cards</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Message *</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-[#141414] border border-white/10 rounded-lg px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={formState === 'submitting'}
                                    className="w-full flex items-center justify-center gap-3 bg-[#D42428] text-white px-10 py-5 rounded-full font-display uppercase tracking-widest font-bold hover:bg-[#B91C1C] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {formState === 'submitting' ? (
                                        <>Sending... <Send className="w-5 h-5 animate-pulse" /></>
                                    ) : (
                                        <>Send Message <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;