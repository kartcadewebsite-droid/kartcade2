import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { User, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DriverProfilePage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    // If already logged in, redirect to dashboard
    React.useEffect(() => {
        if (currentUser) {
            navigate('/dashboard');
        }
    }, [currentUser, navigate]);

    useGSAP(() => {
        const ctx = gsap.context(() => {
            gsap.from('.option-card', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out'
            });

            gsap.from('.page-title', {
                y: -30,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#0A0A0A] text-white">
            {/* Spacing for fixed navbar */}
            <div className="h-20"></div>

            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Page Title */}
                <div className="page-title text-center mb-12">
                    <h1 className="font-display text-4xl md:text-5xl font-bold uppercase mb-4 text-white">
                        Driver Profile
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Sign in to your existing driver profile or create a new one to start booking sessions
                    </p>
                </div>

                {/* Options Grid */}
                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Sign In Option */}
                    <Link
                        to="/login"
                        className="option-card group"
                    >
                        <div className="bg-[#141414] border-2 border-white/10 rounded-2xl p-8 hover:border-[#2D9E49] transition-all duration-300 h-full flex flex-col">
                            <div className="w-16 h-16 rounded-full bg-[#2D9E49]/10 flex items-center justify-center mb-6 group-hover:bg-[#2D9E49]/20 transition-colors">
                                <LogIn className="w-8 h-8 text-[#2D9E49]" />
                            </div>

                            <h2 className="font-display text-2xl font-bold uppercase mb-3 group-hover:text-[#2D9E49] transition-colors">
                                Sign In
                            </h2>

                            <p className="text-white/60 mb-6 flex-1">
                                Already have an account? Sign in to view your bookings, manage your profile, and track your racing stats.
                            </p>

                            <div className="flex items-center gap-2 text-[#2D9E49] font-bold">
                                <span>Sign In to Profile</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* Create Profile Option */}
                    <Link
                        to="/signup"
                        className="option-card group"
                    >
                        <div className="bg-[#141414] border-2 border-white/10 rounded-2xl p-8 hover:border-[#D42428] transition-all duration-300 h-full flex flex-col">
                            <div className="w-16 h-16 rounded-full bg-[#D42428]/10 flex items-center justify-center mb-6 group-hover:bg-[#D42428]/20 transition-colors">
                                <UserPlus className="w-8 h-8 text-[#D42428]" />
                            </div>

                            <h2 className="font-display text-2xl font-bold uppercase mb-3 group-hover:text-[#D42428] transition-colors">
                                Create Profile
                            </h2>

                            <p className="text-white/60 mb-6 flex-1">
                                New to Kartcade? Create your driver profile to start booking sessions, earn rewards, and join our racing community.
                            </p>

                            <div className="flex items-center gap-2 text-[#D42428] font-bold">
                                <span>Create New Profile</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#141414] border border-white/10 rounded-full px-6 py-3">
                        <User className="w-4 h-4 text-[#2D9E49]" />
                        <span className="text-sm text-white/70">
                            All driver profiles include free membership rewards and booking history
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverProfilePage;
