import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowRight, HelpCircle } from 'lucide-react';

const CheckoutCancelPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0A0A0A] pt-24 pb-12">
            <div className="container mx-auto px-4 md:px-6 lg:px-12 max-w-xl text-center">
                {/* Cancel Icon */}
                <div className="w-24 h-24 bg-[#D42428]/20 border border-[#D42428]/30 rounded-full flex items-center justify-center mx-auto mb-8">
                    <XCircle className="w-12 h-12 text-[#D42428]" />
                </div>

                {/* Header */}
                <h1 className="font-display text-4xl md:text-5xl font-bold uppercase text-white mb-4">
                    Payment <span className="text-[#D42428]">Cancelled</span>
                </h1>
                <p className="text-white/60 text-lg mb-8">
                    No worries! Your payment was not processed and you have not been charged.
                </p>

                {/* Options */}
                <div className="bg-[#141414] rounded-2xl p-6 border border-white/10 mb-8 text-left">
                    <h2 className="font-display text-lg font-bold uppercase text-white mb-4">
                        What would you like to do?
                    </h2>
                    <ul className="space-y-4">
                        <li>
                            <Link
                                to="/membership"
                                className="flex items-center gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/50 transition-colors group"
                            >
                                <div className="w-10 h-10 bg-[#2D9E49]/20 rounded-lg flex items-center justify-center">
                                    <ArrowRight className="w-5 h-5 text-[#2D9E49]" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium group-hover:text-[#2D9E49] transition-colors">
                                        Choose a Different Plan
                                    </div>
                                    <div className="text-white/50 text-sm">
                                        Browse our membership options
                                    </div>
                                </div>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/book"
                                className="flex items-center gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/50 transition-colors group"
                            >
                                <div className="w-10 h-10 bg-[#D42428]/20 rounded-lg flex items-center justify-center">
                                    <ArrowRight className="w-5 h-5 text-[#D42428]" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium group-hover:text-[#D42428] transition-colors">
                                        Book Without Membership
                                    </div>
                                    <div className="text-white/50 text-sm">
                                        Pay regular price for a single session
                                    </div>
                                </div>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/contact"
                                className="flex items-center gap-4 p-4 bg-black/30 rounded-xl hover:bg-black/50 transition-colors group"
                            >
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-white/60" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium group-hover:text-white/80 transition-colors">
                                        Need Help?
                                    </div>
                                    <div className="text-white/50 text-sm">
                                        Contact us if you have questions
                                    </div>
                                </div>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Back to Home */}
                <Link
                    to="/"
                    className="text-white/60 hover:text-white text-sm transition-colors"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default CheckoutCancelPage;
