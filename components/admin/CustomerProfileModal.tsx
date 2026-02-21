import React from 'react';
import { X, Mail, Phone, Calendar, Trophy, Star, Clock, CreditCard, Trash2 } from 'lucide-react';
import { crmService, CustomerAnalytics } from '../../services/crm';

interface Props {
    customer: CustomerAnalytics;
    onClose: () => void;
    onRefresh?: () => void;
}

const CustomerProfileModal: React.FC<Props> = ({ customer, onClose, onRefresh }) => {
    // FORCEFUL body scroll lock + Lenis Support
    React.useEffect(() => {
        console.log('🔍 CRM Modal: Mounted - Attempting scroll lock');
        const scrollY = window.scrollY;
        const lenis = (window as any).__lenis;

        // Save original styles
        const originalStyle = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
            height: document.body.style.height
        };

        // 1. Forceful Body Lock (CSS)
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100vw';
        document.body.style.height = '100vh';

        // 2. Lenis Lock (if applicable)
        if (lenis) {
            console.log('🚫 CRM Modal: Stopping Lenis smooth scroll');
            lenis.stop();
        }

        console.log(`✅ CRM Modal: Layout locked (Y: ${scrollY}px)`);

        return () => {
            console.log('🔍 CRM Modal: Unmounting - Restoring scroll');
            document.body.style.overflow = originalStyle.overflow;
            document.body.style.position = originalStyle.position;
            document.body.style.top = originalStyle.top;
            document.body.style.width = originalStyle.width;
            document.body.style.height = originalStyle.height;

            if (lenis) {
                console.log('✅ CRM Modal: Starting Lenis smooth scroll');
                lenis.start();
            }

            window.scrollTo(0, scrollY);
        };
    }, []);

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        if (date.toDate) return date.toDate().toLocaleDateString();
        if (typeof date === 'string') return new Date(date).toLocaleDateString();
        return 'N/A';
    };

    const handleDeleteTransaction = async (txId: string) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this transaction record? This will remove it from the CRM ledger and update the customer stats.')) return;

        try {
            await crmService.deleteTransaction(txId);
            if (onRefresh) onRefresh();
            // We should also ideally update the local modal state, 
            // but closing/re-opening or full refresh is safer for stats consistency.
            window.alert('Transaction deleted.');
        } catch (err) {
            console.error('Delete failed:', err);
            window.alert('Failed to delete transaction.');
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            <div
                className="relative bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onWheel={(e) => {
                    console.log('🛞 CRM Modal: Wheel event intercepted (outer)');
                    e.stopPropagation();
                }}
                data-lenis-prevent
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 px-6 py-5 flex items-center justify-between z-20">
                    <div>
                        <h2 className="font-display text-xl font-bold text-white uppercase tracking-tight">Customer Profile</h2>
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">CRM Analytics System</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area - Scrollable */}
                <div
                    className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8"
                    onWheel={(e) => {
                        console.log('🛞 CRM Modal: Wheel event intercepted (inner)');
                        e.stopPropagation();
                    }}
                    data-lenis-prevent
                >
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#D42428] to-[#2D9E49] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative w-24 h-24 md:w-20 md:h-20 rounded-full bg-[#141414] border-2 border-white/10 flex items-center justify-center overflow-hidden">
                                {customer.photoURL ? (
                                    <img src={customer.photoURL} alt={customer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[#D42428] text-3xl md:text-2xl font-bold">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-white font-bold text-2xl md:text-xl mb-1">{customer.name}</h3>
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-white/50 text-sm">
                                <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                                    <Mail className="w-4 h-4 text-[#D42428]" /> {customer.email}
                                </span>
                                {customer.phone && (
                                    <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                                        <Phone className="w-4 h-4 text-[#2D9E49]" /> {customer.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white/[0.02] hover:bg-white/[0.05] transition-colors rounded-2xl p-4 border border-white/5 group">
                            <div className="w-8 h-8 rounded-lg bg-[#2D9E49]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <CreditCard className="w-4 h-4 text-[#2D9E49]" />
                            </div>
                            <p className="text-white text-2xl font-bold tracking-tight">${customer.totalSpend.toFixed(0)}</p>
                            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-1">Total Spend</p>
                        </div>
                        <div className="bg-white/[0.02] hover:bg-white/[0.05] transition-colors rounded-2xl p-4 border border-white/5 group">
                            <div className="w-8 h-8 rounded-lg bg-[#D42428]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Calendar className="w-4 h-4 text-[#D42428]" />
                            </div>
                            <p className="text-white text-2xl font-bold tracking-tight">
                                {customer.visitCount}
                                {customer.cancelCount > 0 && (
                                    <span className="text-red-500/40 text-sm ml-1">({customer.cancelCount})</span>
                                )}
                            </p>
                            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-1">Total Visits</p>
                        </div>
                        <div className="bg-white/[0.02] hover:bg-white/[0.05] transition-colors rounded-2xl p-4 border border-white/5 group">
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Star className="w-4 h-4 text-yellow-500" />
                            </div>
                            <p className="text-white text-lg font-bold tracking-tight truncate capitalize">{customer.favoriteEquipment || '—'}</p>
                            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-1">Favorite Rank</p>
                        </div>
                        <div className="bg-white/[0.02] hover:bg-white/[0.05] transition-colors rounded-2xl p-4 border border-white/5 group">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Clock className="w-4 h-4 text-purple-400" />
                            </div>
                            <p className="text-white text-2xl font-bold tracking-tight">{customer.totalHours}h</p>
                            <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest mt-1">Time Logged</p>
                        </div>
                    </div>

                    {/* Membership Status */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl p-5 border border-white/5">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Trophy className="w-16 h-16" />
                        </div>
                        <h4 className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-3">Membership Status</h4>
                        {customer.membershipActive ? (
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#2D9E49]/20">
                                    <Trophy className="w-5 h-5 text-[#2D9E49]" />
                                </div>
                                <div>
                                    <span className="text-white font-bold text-lg capitalize">{customer.membershipTier || 'Gold Member'}</span>
                                    <p className="text-white/30 text-xs mt-0.5">Privilege access active</p>
                                </div>
                                <span className="ml-auto px-3 py-1 bg-[#2D9E49]/20 text-[#2D9E49] text-[10px] font-bold uppercase rounded-full border border-[#2D9E49]/30">Active</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 opacity-50">
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-white/40 font-medium">Standard Non-Member Profile</p>
                            </div>
                        )}
                    </div>

                    {/* Transaction History */}
                    {customer.transactions.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Transaction Ledger</h4>
                                <span className="text-[10px] text-white/20">{customer.transactions.length} records found</span>
                            </div>
                            <div className="space-y-3">
                                {customer.transactions.map((tx, i) => (
                                    <div key={i} className="group flex items-center justify-between bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] rounded-xl px-5 py-4 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-10 rounded-full ${tx.status === 'cancelled' ? 'bg-red-500/20' : 'bg-[#2D9E49]/20 group-hover:animate-pulse'}`}></div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-bold text-sm tracking-tight ${tx.status === 'cancelled' ? 'text-red-400' :
                                                        tx.type === 'membership_purchase' ? 'text-white' :
                                                            tx.type === 'membership_renewal' ? 'text-purple-400' :
                                                                'text-[#2D9E49]'
                                                        }`}>
                                                        {tx.status === 'cancelled' ? 'CANCELLED' :
                                                            tx.type === 'membership_purchase' ? 'MEMBERSHIP' :
                                                                tx.type === 'membership_renewal' ? 'RENEWAL' :
                                                                    'BOOKING'}
                                                    </span>
                                                    {tx.status === 'cancelled' && <span className="text-[10px] text-red-500/50 uppercase font-bold">Void</span>}
                                                </div>
                                                <div className="flex items-center gap-3 text-white/30 text-[11px]">
                                                    {tx.station && <span className="capitalize">{tx.station}</span>}
                                                    {tx.tierName && <span>Tier: {tx.tierName}</span>}
                                                    {tx.date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tx.date}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className={`text-lg font-mono font-bold tracking-tighter ${tx.status === 'cancelled' ? 'text-white/10' : 'text-white'}`}>
                                                    ${tx.amount.toFixed(2)}
                                                </span>
                                                <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mt-0.5">USD Total</p>
                                            </div>
                                            {tx.id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteTransaction(tx.id!);
                                                    }}
                                                    className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete Record Permanently"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Join Date: {formatDate(customer.registrationDate)}
                        </div>
                        <div className="flex items-center gap-2">
                            AuthID: {customer.userId.slice(0, 12)}...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfileModal;
