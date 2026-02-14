import React from 'react';
import { X, Mail, Phone, Calendar, Trophy, Star, Clock, CreditCard } from 'lucide-react';
import { CustomerAnalytics } from '../../services/crm';

interface Props {
    customer: CustomerAnalytics;
    onClose: () => void;
}

const CustomerProfileModal: React.FC<Props> = ({ customer, onClose }) => {
    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        if (date.toDate) return date.toDate().toLocaleDateString();
        if (typeof date === 'string') return new Date(date).toLocaleDateString();
        return 'N/A';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-[#141414] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="font-display text-xl font-bold text-white uppercase">Customer Profile</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-[#D42428]/20 border-2 border-[#D42428]/50 flex items-center justify-center overflow-hidden">
                            {customer.photoURL ? (
                                <img src={customer.photoURL} alt={customer.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[#D42428] text-2xl font-bold">
                                    {customer.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">{customer.name}</h3>
                            <div className="flex items-center gap-4 text-white/50 text-sm">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {customer.email}
                                </span>
                                {customer.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" /> {customer.phone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <CreditCard className="w-4 h-4 text-[#2D9E49] mb-2" />
                            <p className="text-[#2D9E49] text-xl font-bold">${customer.totalSpend.toFixed(0)}</p>
                            <p className="text-white/40 text-xs">Total Spend</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <Calendar className="w-4 h-4 text-[#D42428] mb-2" />
                            <p className="text-[#D42428] text-xl font-bold">
                                {customer.visitCount}
                                {customer.cancelCount > 0 && (
                                    <span className="text-red-400/60 text-sm ml-1">({customer.cancelCount} cancelled)</span>
                                )}
                            </p>
                            <p className="text-white/40 text-xs">Total Visits</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <Star className="w-4 h-4 text-yellow-500 mb-2" />
                            <p className="text-yellow-500 text-xl font-bold capitalize">{customer.favoriteEquipment || '—'}</p>
                            <p className="text-white/40 text-xs">Favorite</p>
                        </div>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                            <Clock className="w-4 h-4 text-purple-400 mb-2" />
                            <p className="text-purple-400 text-xl font-bold">{customer.totalHours}h</p>
                            <p className="text-white/40 text-xs">Total Hours</p>
                        </div>
                    </div>

                    {/* Membership Status */}
                    <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <h4 className="text-white/40 text-xs uppercase tracking-wider mb-2">Membership</h4>
                        {customer.membershipActive ? (
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#2D9E49]" />
                                <span className="text-[#2D9E49] font-bold capitalize">{customer.membershipTier || 'Active'}</span>
                                <span className="ml-auto px-2 py-0.5 bg-[#2D9E49]/20 text-[#2D9E49] text-xs rounded-full">Active</span>
                            </div>
                        ) : (
                            <p className="text-white/40">No active membership</p>
                        )}
                    </div>

                    {/* Registration Info */}
                    <div className="text-white/30 text-xs">
                        Registered: {formatDate(customer.registrationDate)}
                    </div>

                    {/* Transaction History */}
                    {customer.transactions.length > 0 && (
                        <div>
                            <h4 className="text-white/40 text-xs uppercase tracking-wider mb-3">Transaction History</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {customer.transactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between bg-black/20 rounded-lg px-4 py-2 text-sm">
                                        <div>
                                            <span className={`font-medium ${tx.status === 'cancelled' ? 'text-red-400 line-through' :
                                                tx.type === 'membership_purchase' ? 'text-[#D42428]' :
                                                    tx.type === 'membership_renewal' ? 'text-purple-400' :
                                                        'text-[#2D9E49]'
                                                }`}>
                                                {tx.status === 'cancelled' ? '❌ Cancelled' :
                                                    tx.type === 'membership_purchase' ? '🏆 Membership' :
                                                        tx.type === 'membership_renewal' ? '🔄 Renewal' :
                                                            `🏎️ Booking`}
                                            </span>
                                            {tx.station && <span className="text-white/40 ml-2 capitalize">({tx.station})</span>}
                                            {tx.tierName && <span className="text-white/40 ml-2">({tx.tierName})</span>}
                                            {tx.date && <span className="text-white/20 ml-2 text-xs">{tx.date}</span>}
                                        </div>
                                        <span className={`font-mono ${tx.status === 'cancelled' ? 'text-red-400/50 line-through' : 'text-white'}`}>${tx.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default CustomerProfileModal;
