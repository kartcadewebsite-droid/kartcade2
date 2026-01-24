import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            setLoading(true);
            await resetPassword(email);
            setSuccess(true);
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative bg-[#0A0A0A] min-h-screen pt-20 md:pt-24 pb-12">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="absolute top-0 left-1/4 w-32 h-full bg-gradient-to-b from-[#2D9E49] to-transparent transform -skew-x-12"></div>
                <div className="absolute top-0 left-1/3 w-16 h-full bg-gradient-to-b from-white to-transparent transform -skew-x-12"></div>
                <div className="absolute top-0 left-[40%] w-32 h-full bg-gradient-to-b from-[#D42428] to-transparent transform -skew-x-12"></div>
            </div>

            <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-10">
                <div className="max-w-md mx-auto">
                    {/* Back Link */}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign In
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase text-white mb-2">
                            Reset<br />
                            <span className="text-[#D42428]">Password</span>
                        </h1>
                        <p className="text-white/60 font-sans text-sm">
                            Enter your email and we'll send you a reset link
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-[#141414] rounded-2xl p-6 md:p-8 border border-white/10">
                        {success ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-[#2D9E49]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-[#2D9E49]" />
                                </div>
                                <h2 className="font-display text-xl font-bold text-white mb-2">Check Your Email</h2>
                                <p className="text-white/60 text-sm mb-6">
                                    We've sent a password reset link to <strong className="text-white">{email}</strong>
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-[#2D9E49] hover:underline"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Sign In
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-[#D42428]/10 border border-[#D42428]/30 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-[#D42428] flex-shrink-0 mt-0.5" />
                                        <p className="text-[#D42428] text-sm">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-white/60 text-sm mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-white/30 focus:border-[#2D9E49] focus:outline-none transition-colors"
                                                placeholder="you@email.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-4 py-4 bg-[#D42428] text-white rounded-full font-display uppercase tracking-widest font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#b91f22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
