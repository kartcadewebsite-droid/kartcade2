import React, { useState, useRef } from 'react';
import { Check, Upload, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================
// FORM CONFIGURATION - Update this URL with your form backend
// Options: Google Apps Script, Formspree, EmailJS, or your own API
// See documentation for setup instructions
// ============================================================
const FORM_ENDPOINT_URL = 'YOUR_FORM_ENDPOINT_HERE';

const ExpressLaunchPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        businessName: '',
        industry: '',
        services: '',
        about: '',
        name: '',
        email: '',
        countryCode: '91',
        phoneNumber: ''
    });

    // File State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Prepare logo data if file exists
            let logoData = null;
            if (logoFile) {
                const base64 = await fileToBase64(logoFile);
                logoData = {
                    name: `${formData.businessName.replace(/\s+/g, '_')}_logo_${Date.now()}.${logoFile.name.split('.').pop()}`,
                    type: logoFile.type,
                    data: base64
                };
            }

            // Send data with countryCode and phoneNumber as separate fields
            const submissionData = {
                ...formData,
                logo: logoData
            };

            // Send to Google Apps Script
            const response = await fetch(FORM_ENDPOINT_URL, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            // no-cors mode doesn't return response, assume success
            setIsSubmitting(false);
            setIsSuccess(true);
            window.scrollTo(0, 0);

        } catch (err) {
            console.error('Submission error:', err);
            setError('Failed to submit. Please try again or contact us directly.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white">
            <div className="min-h-screen flex flex-col lg:flex-row">

                {/* Left: Manifest */}
                <div className="w-full lg:w-5/12 bg-black text-white p-6 md:p-16 lg:p-24 flex flex-col justify-between pt-24 md:pt-32">
                    <div>
                        <Link to="/" className="inline-block font-display font-medium text-lg mb-16 hover:opacity-70 transition-opacity">
                            ← Back to Home
                        </Link>

                        <div className="space-y-2 mb-12">
                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40 block">Express Service</span>
                            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl uppercase leading-[1.1] tracking-wide">
                                Get a Website<br />
                                Within a Week
                            </h1>
                        </div>

                        <p className="font-sans text-white/60 text-lg leading-relaxed max-w-sm mb-12">
                            Fill the form and get free website preview within 24 hours.
                        </p>

                        <div className="border-t border-white/20 pt-8 space-y-4">
                            <div className="flex items-baseline justify-between">
                                <span className="font-mono text-xs uppercase tracking-widest text-white/40">Initial Stage</span>
                                <span className="font-display text-lg">24h Preview (Comp.)</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="font-mono text-xs uppercase tracking-widest text-white/40">Cost</span>
                                <span className="font-display text-lg">$799 Total</span>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="font-mono text-xs uppercase tracking-widest text-white/40">Full Launch</span>
                                <span className="font-display text-lg">$799</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Right: The Form */}
                <div className="w-full lg:w-7/12 bg-white p-4 md:p-16 lg:p-24 pt-8 md:pt-32 flex items-center">
                    <div className="w-full max-w-2xl border border-black/10 p-4 md:p-12">

                        {!isSuccess ? (
                            <form onSubmit={handleSubmit} className="space-y-12">
                                {/* Header */}
                                <div className="flex justify-between items-baseline border-b border-black/10 pb-4 md:pb-6">
                                    <h2 className="font-display text-lg md:text-2xl uppercase tracking-wide">Project Details</h2>
                                    <span className="font-mono text-xs text-black/40">Step 0{step} / 03</span>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                {step === 1 && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="space-y-2">
                                            <label className="block font-mono text-xs uppercase tracking-widest text-black/40">Business Name</label>
                                            <input
                                                required
                                                name="businessName"
                                                value={formData.businessName}
                                                onChange={handleChange}
                                                type="text"
                                                className="w-full bg-transparent border-b-2 border-black/10 py-3 md:py-4 text-lg md:text-2xl font-display uppercase focus:outline-none focus:border-black transition-colors placeholder:text-black/10"
                                                placeholder="YOUR BRAND"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block font-mono text-xs uppercase tracking-widest text-black/40">Industry</label>
                                            <input
                                                required
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                type="text"
                                                className="w-full bg-transparent border-b-2 border-black/10 py-3 md:py-4 text-lg md:text-2xl font-display uppercase focus:outline-none focus:border-black transition-colors placeholder:text-black/10"
                                                placeholder="REAL ESTATE"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="block font-mono text-xs uppercase tracking-widest text-black/40">Logo Upload (Optional)</span>
                                            <label
                                                className={`border p-6 flex items-center justify-center gap-4 cursor-pointer hover:bg-black/5 transition-colors ${logoPreview ? 'border-black' : 'border-black/10'}`}
                                            >
                                                {logoPreview ? (
                                                    <div className="flex items-center gap-4">
                                                        <img src={logoPreview} alt="Logo preview" className="w-12 h-12 object-contain" />
                                                        <span className="font-mono text-xs uppercase text-black/60">{logoFile?.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-5 h-5 text-black/40" />
                                                        <span className="font-mono text-xs uppercase text-black/60">Click to Select File</span>
                                                    </>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                                    className="text-xs text-red-500 hover:underline mt-2"
                                                >
                                                    Remove logo
                                                </button>
                                            )}
                                        </div>
                                        <div className="pt-8 flex justify-end">
                                            <button type="button" onClick={() => setStep(2)} className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center gap-2">
                                                Next Step <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="space-y-2">
                                            <label className="block font-mono text-xs uppercase tracking-widest text-black/40">Core Services</label>
                                            <textarea
                                                required
                                                name="services"
                                                value={formData.services}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full bg-transparent border-b-2 border-black/10 py-4 text-lg font-sans focus:outline-none focus:border-black transition-colors placeholder:text-black/20 resize-none"
                                                placeholder="List your main services here..."
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block font-mono text-xs uppercase tracking-widest text-black/40">About Business</label>
                                            <textarea
                                                required
                                                name="about"
                                                value={formData.about}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full bg-transparent border-b-2 border-black/10 py-4 text-lg font-sans focus:outline-none focus:border-black transition-colors placeholder:text-black/20 resize-none"
                                                placeholder="Brief description of your business..."
                                            />
                                        </div>
                                        <div className="pt-8 flex justify-between items-center">
                                            <button type="button" onClick={() => setStep(1)} className="text-black/40 hover:text-black px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors">
                                                Back
                                            </button>
                                            <button type="button" onClick={() => setStep(3)} className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center gap-2">
                                                Next Step <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8 animate-fadeIn">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                            <div className="space-y-2">
                                                <label className="block font-mono text-xs uppercase tracking-widest text-black/40">Your Name</label>
                                                <input
                                                    required
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    type="text"
                                                    className="w-full bg-transparent border-b-2 border-black/10 py-3 text-lg font-sans focus:outline-none focus:border-black transition-colors"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block font-mono text-xs uppercase tracking-widest text-black/40">Phone</label>
                                                <div className="flex gap-2">
                                                    <div className="flex items-center border-b-2 border-black/10 focus-within:border-black transition-colors">
                                                        <span className="text-lg font-sans text-black/40">+</span>
                                                        <input
                                                            required
                                                            name="countryCode"
                                                            value={formData.countryCode}
                                                            onChange={handleChange}
                                                            type="text"
                                                            className="w-16 bg-transparent py-3 text-lg font-sans focus:outline-none text-center"
                                                            placeholder="91"
                                                        />
                                                    </div>
                                                    <input
                                                        required
                                                        name="phoneNumber"
                                                        value={formData.phoneNumber}
                                                        onChange={handleChange}
                                                        type="tel"
                                                        className="flex-1 bg-transparent border-b-2 border-black/10 py-3 text-lg font-sans focus:outline-none focus:border-black transition-colors"
                                                        placeholder="1234567890"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block font-mono text-xs uppercase tracking-widest text-black/40">Email Address</label>
                                            <input
                                                required
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                type="email"
                                                className="w-full bg-transparent border-b-2 border-black/10 py-3 text-lg font-sans focus:outline-none focus:border-black transition-colors"
                                                placeholder="john@example.com"
                                            />
                                        </div>

                                        <div className="bg-gray-50 p-6">
                                            <div className="font-mono text-xs text-black/60 uppercase tracking-widest text-center">
                                                We will create a custom preview and email it to you within 24 hours.
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-between items-center">
                                            <button type="button" onClick={() => setStep(2)} className="text-black/40 hover:text-black px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors">
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="bg-black text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-black/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Processing...' : 'Submit Request'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="text-center py-12 animate-fadeIn">
                                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                                    <Check className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="font-display text-3xl uppercase mb-6">Request Received</h2>
                                <p className="text-black/60 font-sans text-lg mb-12 max-w-sm mx-auto">
                                    We received your details. Expect your custom website preview in your inbox within 24 hours.
                                </p>
                                <Link to="/" className="inline-block border border-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    Back to Home
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ExpressLaunchPage;
