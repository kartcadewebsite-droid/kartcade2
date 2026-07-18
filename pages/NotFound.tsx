import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
    useEffect(() => {
        document.title = "Page Not Found | Kartcade";
    }, []);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-6 py-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-950/10 z-0" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2D9E49]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-md w-full border border-white/5 bg-white/[0.01] backdrop-blur-md p-8 sm:p-12 rounded-3xl">
                <div className="w-16 h-16 bg-[#D42428]/10 text-[#D42428] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D42428]/20 animate-pulse">
                    <AlertCircle className="w-8 h-8" />
                </div>
                
                <h1 className="font-display text-7xl font-black text-white mb-2 tracking-tighter">
                    404
                </h1>
                
                <h2 className="text-xl font-bold uppercase tracking-widest text-white/90 mb-4">
                    Page Not Found
                </h2>
                
                <p className="text-white/40 text-sm mb-8 leading-relaxed">
                    The race track you're looking for doesn't exist, or the link has changed. 
                </p>
                
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-white/90 font-bold uppercase tracking-wider rounded-full text-xs transition-all duration-300"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Homepage
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
