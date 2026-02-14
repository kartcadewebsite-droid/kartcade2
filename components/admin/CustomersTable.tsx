import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Download, Users, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { CustomerAnalytics } from '../../services/crm';
import { exportCustomersToCSV } from '../../utils/csvExport';
import CustomerProfileModal from './CustomerProfileModal';

interface Props {
    customers: CustomerAnalytics[];
    loading: boolean;
}

type SortField = 'name' | 'totalSpend' | 'visitCount' | 'totalHours' | 'lastVisit' | 'favoriteEquipment' | 'membershipTier';
type SortDir = 'asc' | 'desc';

const CustomersTable: React.FC<Props> = ({ customers, loading }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('totalSpend');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerAnalytics | null>(null);

    // Filter + Sort
    const filteredCustomers = useMemo(() => {
        let result = [...customers];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone && c.phone.includes(q))
            );
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'totalSpend':
                    comparison = a.totalSpend - b.totalSpend;
                    break;
                case 'visitCount':
                    comparison = a.visitCount - b.visitCount;
                    break;
                case 'totalHours':
                    comparison = a.totalHours - b.totalHours;
                    break;
                case 'lastVisit':
                    comparison = (a.lastVisit || '').localeCompare(b.lastVisit || '');
                    break;
                case 'favoriteEquipment':
                    comparison = (a.favoriteEquipment || '').localeCompare(b.favoriteEquipment || '');
                    break;
                case 'membershipTier':
                    comparison = (a.membershipTier || '').localeCompare(b.membershipTier || '');
                    break;
            }
            return sortDir === 'desc' ? -comparison : comparison;
        });

        return result;
    }, [customers, searchQuery, sortField, sortDir]);

    // Summary stats
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
    const totalVisits = customers.reduce((sum, c) => sum + c.visitCount, 0);
    const totalHoursAll = customers.reduce((sum, c) => sum + c.totalHours, 0);
    const activeMembers = customers.filter(c => c.membershipActive).length;

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronDown className="w-3 h-3 text-white/20" />;
        return sortDir === 'desc'
            ? <ChevronDown className="w-3 h-3 text-[#D42428]" />
            : <ChevronUp className="w-3 h-3 text-[#D42428]" />;
    };

    const getMembershipColor = (tier: string | null) => {
        if (!tier) return 'text-white/30';
        const t = tier.toLowerCase();
        if (t.includes('gold')) return 'text-yellow-400';
        if (t.includes('silver')) return 'text-gray-300';
        if (t.includes('bronze')) return 'text-orange-400';
        return 'text-[#2D9E49]';
    };

    return (
        <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#D42428]" />
                        <span className="text-white/40 text-xs uppercase">Total Customers</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{customers.length}</p>
                    <p className="text-[#2D9E49] text-xs">{activeMembers} active members</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-[#2D9E49]" />
                        <span className="text-white/40 text-xs uppercase">Total Revenue</span>
                    </div>
                    <p className="text-[#2D9E49] text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#D42428]" />
                        <span className="text-white/40 text-xs uppercase">Total Visits</span>
                    </div>
                    <p className="text-white text-2xl font-bold">{totalVisits}</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-white/40 text-xs uppercase">Total Hours</span>
                    </div>
                    <p className="text-purple-400 text-2xl font-bold">{totalHoursAll}h</p>
                </div>
            </div>

            {/* Search + Export */}
            <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#D42428]/50"
                    />
                </div>
                <button
                    onClick={() => exportCustomersToCSV(filteredCustomers)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#2D9E49] hover:bg-[#2D9E49]/80 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#D42428] border-t-transparent rounded-full animate-spin" />
                    <span className="ml-3 text-white/40">Loading customers...</span>
                </div>
            )}

            {/* Table */}
            {!loading && (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                    <table className="w-full text-sm">
                        <thead className="bg-black/40">
                            <tr className="text-left text-white/40 text-xs uppercase">
                                <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">Customer <SortIcon field="name" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('totalSpend')}>
                                    <div className="flex items-center gap-1">Spent <SortIcon field="totalSpend" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('visitCount')}>
                                    <div className="flex items-center gap-1">Visits <SortIcon field="visitCount" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('totalHours')}>
                                    <div className="flex items-center gap-1">Hours <SortIcon field="totalHours" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('lastVisit')}>
                                    <div className="flex items-center gap-1">Last Visit <SortIcon field="lastVisit" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('favoriteEquipment')}>
                                    <div className="flex items-center gap-1">Favorite <SortIcon field="favoriteEquipment" /></div>
                                </th>
                                <th className="px-4 py-3 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('membershipTier')}>
                                    <div className="flex items-center gap-1">Membership <SortIcon field="membershipTier" /></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-white/30">
                                        {searchQuery ? 'No customers match your search' : 'No customer data yet'}
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <tr
                                        key={customer.userId}
                                        onClick={() => setSelectedCustomer(customer)}
                                        className="hover:bg-white/5 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#D42428]/20 border border-[#D42428]/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {customer.photoURL ? (
                                                        <img src={customer.photoURL} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[#D42428] text-xs font-bold">
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{customer.name}</p>
                                                    <p className="text-white/30 text-xs">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-mono font-medium ${customer.totalSpend > 200 ? 'text-[#2D9E49]' : 'text-white/60'}`}>
                                                ${customer.totalSpend.toFixed(0)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-white/60">{customer.visitCount}</span>
                                            {customer.cancelCount > 0 && (
                                                <span className="text-red-400/60 text-xs ml-1">({customer.cancelCount} cancelled)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-purple-400 font-mono">{customer.totalHours}h</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-white/40 text-xs">{customer.lastVisit || 'Never'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-white/60 capitalize">{customer.favoriteEquipment || '—'}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`capitalize font-medium ${getMembershipColor(customer.membershipTier)}`}>
                                                {customer.membershipTier
                                                    ? customer.membershipTier.replace(/-/g, ' ')
                                                    : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Result Count */}
            {!loading && searchQuery && (
                <p className="text-white/30 text-xs mt-2">
                    Showing {filteredCustomers.length} of {customers.length} customers
                </p>
            )}

            {/* Profile Modal */}
            {selectedCustomer && (
                <CustomerProfileModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}
        </div>
    );
};

export default CustomersTable;
