import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CreditCard, Calendar, Clock, LogOut, ArrowRight, Zap, X, AlertCircle, Gauge, Monitor, Rocket, Edit2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi } from '../config/booking';
import { getMembershipById } from '../config/membership';

interface Booking {
    id: string;
    date: string;
    time: string;
    station: string;
    drivers: number;
    name: string;
    email: string;
    status: string;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile, logout, isAdmin, getCredits, updateProfile } = useAuth();

    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Edit Profile State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        favDiscipline: '',
        favTrack: '',
        favCar: '',
        favRig: '',
        settings: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Get real membership and credits from user profile
    const membership = userProfile?.membership?.active ? userProfile.membership : null;
    const membershipTier = membership ? getMembershipById(membership.tier) : null;

    // Get credits for each equipment type
    const kartCredits = getCredits('kart');
    const rigCredits = getCredits('rig');
    const motionCredits = getCredits('motion');
    const totalCredits = kartCredits + rigCredits + motionCredits;

    // Calculate days until next billing
    const getDaysUntilBilling = () => {
        if (!membership?.nextBillingDate) return null;
        const nextBilling = new Date(membership.nextBillingDate);
        const now = new Date();
        const diffTime = nextBilling.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    // Fetch user's bookings
    useEffect(() => {
        const fetchBookings = async () => {
            if (!currentUser?.email) return;

            try {
                setLoadingBookings(true);
                const response = await bookingApi.getUserBookings(currentUser.email);
                if (response.success) {
                    setUpcomingBookings(response.bookings || []);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoadingBookings(false);
            }
        };

        fetchBookings();
        fetchBookings();
    }, [currentUser?.email]);

    // Populate edit form when profile loads or modal opens
    useEffect(() => {
        if (userProfile) {
            setEditFormData({
                favDiscipline: userProfile.favDiscipline || '',
                favTrack: userProfile.favTrack || '',
                favCar: userProfile.favCar || '',
                favRig: userProfile.favRig || '',
                settings: userProfile.settings || '',
            });
        }
    }, [userProfile, showEditModal]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const handleCancelBooking = (bookingId: string) => {
        // Redirect to cancel page to handle refunds/credits logic
        navigate(`/cancel?id=${bookingId}`);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError('');

        try {
            await updateProfile(editFormData);
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            setSaveError('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // Filter bookings
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Include today in upcoming

    const upcomingList = upcomingBookings.filter(b => {
        const bookingDate = new Date(b.date);
        // Correct timezone offset issue by treating the YYYY-MM-DD as local
        const localDate = new Date(bookingDate.valueOf() + bookingDate.getTimezoneOffset() * 60000);
        return localDate >= now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const historyList = upcomingBookings.filter(b => {
        const bookingDate = new Date(b.date);
        const localDate = new Date(bookingDate.valueOf() + bookingDate.getTimezoneOffset() * 60000);
        return localDate < now;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Get station color
    const getStationColor = (station: string) => {
        const colors: { [key: string]: string } = {
            'Racing Karts': '#2D9E49',
            'Full-Size Rigs': '#FFFFFF',
            'Motion Simulator': '#D42428',
            'Flight Simulator': '#2D9E49'
        };
        return colors[station] || '#2D9E49';
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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <span className="font-mono text-[#2D9E49] tracking-widest uppercase text-xs md:text-sm mb-2 block">
                            Driver Profile
                            {isAdmin && (
                                <span className="ml-2 px-2 py-0.5 bg-[#D42428] text-white text-[10px] rounded-full uppercase">
                                    Admin
                                </span>
                            )}
                        </span>
                        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase text-white">
                            Welcome, <span className="text-[#D42428]">{userProfile?.name || 'Racer'}</span>
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-4 md:mt-0 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-[#D42428]/10 border border-[#D42428]/30 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#D42428] flex-shrink-0 mt-0.5" />
                        <p className="text-[#D42428] text-sm">{error}</p>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-[#141414] rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#2D9E49]/20 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-[#2D9E49]" />
                            </div>
                            <div>
                                <h2 className="font-display text-lg font-bold text-white uppercase">
                                    {userProfile?.name || 'Driver'}
                                </h2>
                                <p className="text-white/60 text-sm">{currentUser?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm border-b border-white/10 pb-4 mb-4">
                            <div className="flex justify-between">
                                <span className="text-white/60">Phone</span>
                                <span className="text-white">{userProfile?.phone || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Waiver</span>
                                <span className="text-[#2D9E49]">✓ Accepted</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/60">Rules</span>
                                <span className="text-[#2D9E49]">✓ Accepted</span>
                            </div>
                        </div>

                        {/* Driver Specs */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-display text-white/50 text-xs uppercase tracking-widest">Driver Specs</h3>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="text-[#2D9E49] hover:text-white transition-colors text-xs flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" /> Edit
                                </button>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="block text-white/40 text-[10px] uppercase">Fav Car</span>
                                        <span className="text-white truncate block" title={userProfile?.favCar}>{userProfile?.favCar || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-white/40 text-[10px] uppercase">Fav Track</span>
                                        <span className="text-white truncate block" title={userProfile?.favTrack}>{userProfile?.favTrack || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-white/40 text-[10px] uppercase">Discipline</span>
                                        <span className="text-white truncate block" title={userProfile?.favDiscipline}>{userProfile?.favDiscipline || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-white/40 text-[10px] uppercase">Rig</span>
                                        <span className="text-white truncate block" title={userProfile?.favRig}>{userProfile?.favRig || '-'}</span>
                                    </div>
                                </div>
                                {userProfile?.settings && (
                                    <div className="pt-2">
                                        <span className="block text-white/40 text-[10px] uppercase">Notes</span>
                                        <span className="text-white/80 italic text-xs block">{userProfile.settings}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Membership Card */}
                    <div className="bg-[#141414] rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-[#D42428]/20 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-[#D42428]" />
                            </div>
                            <div>
                                <h2 className="font-display text-lg font-bold text-white uppercase">Membership</h2>
                                <p className="text-white/60 text-sm">
                                    {membership ? membershipTier?.name || 'Active' : 'No active membership'}
                                </p>
                            </div>
                        </div>

                        {membership && membershipTier ? (
                            <div className="space-y-4">
                                {/* Membership Details */}
                                <div className="p-4 rounded-xl" style={{ backgroundColor: `${membershipTier.color}20` }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: membershipTier.color }}
                                        ></div>
                                        <span className="font-display font-bold text-white uppercase text-sm">
                                            {membershipTier.name}
                                        </span>
                                    </div>
                                    <div className="text-white/60 text-xs">
                                        {membershipTier.credits} credits/month • ${membershipTier.price}/mo
                                    </div>
                                </div>

                                {/* Next Billing */}
                                {getDaysUntilBilling() !== null && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Next billing</span>
                                        <span className="text-white">{getDaysUntilBilling()} days</span>
                                    </div>
                                )}

                                <Link
                                    to="/membership"
                                    className="block text-center text-sm text-[#D42428] hover:underline"
                                >
                                    Manage subscription →
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-white/60 text-sm mb-4">
                                    Upgrade to a membership for 50% off every hour!
                                </p>
                                <Link
                                    to="/membership"
                                    className="inline-flex items-center gap-2 bg-[#D42428] text-white px-6 py-3 rounded-full font-display uppercase tracking-widest font-bold text-xs hover:bg-[#b91f22] transition-colors"
                                >
                                    View Plans <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Credits Card */}
                    <div className="bg-[#141414] rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6 text-yellow-500" />
                            </div>
                            <div>
                                <h2 className="font-display text-lg font-bold text-white uppercase">Credits</h2>
                                <p className="text-white/60 text-sm">Available balance</p>
                            </div>
                        </div>

                        {totalCredits > 0 ? (
                            <div className="space-y-3">
                                {/* Kart Credits */}
                                {kartCredits > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-[#2D9E49]/10 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Gauge className="w-4 h-4 text-[#2D9E49]" />
                                            <span className="text-white text-sm">Kart Credits</span>
                                        </div>
                                        <span className="font-bold text-[#2D9E49]">{kartCredits} hrs</span>
                                    </div>
                                )}

                                {/* Rig Credits */}
                                {rigCredits > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="w-4 h-4 text-white" />
                                            <span className="text-white text-sm">Rig Credits</span>
                                        </div>
                                        <span className="font-bold text-white">{rigCredits} hrs</span>
                                    </div>
                                )}

                                {/* Motion Credits */}
                                {motionCredits > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-[#D42428]/10 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Rocket className="w-4 h-4 text-[#D42428]" />
                                            <span className="text-white text-sm">Motion Credits</span>
                                        </div>
                                        <span className="font-bold text-[#D42428]">{motionCredits} hrs</span>
                                    </div>
                                )}

                                <p className="text-white/40 text-xs text-center pt-2">
                                    1 credit = 1 hour (50% off)
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-5xl font-bold text-white/20 mb-2">0</div>
                                <p className="text-white/40 text-sm">No credits available</p>
                                <p className="text-white/30 text-xs mt-2">
                                    Get a membership to earn credits
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="mt-8">
                    <h2 className="font-display text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#2D9E49]" />
                        Upcoming Bookings
                    </h2>
                    <div className="bg-[#141414] rounded-2xl p-6 border border-white/10">
                        {loadingBookings ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2D9E49] mx-auto mb-4"></div>
                                <p className="text-white/60">Loading bookings...</p>
                            </div>
                        ) : upcomingList.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingList.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Date/Time */}
                                            <div className="text-center min-w-[60px]">
                                                <div className="text-2xl font-bold text-white">
                                                    {new Date(booking.date).getUTCDate()}
                                                </div>
                                                <div className="text-xs text-white/60 uppercase">
                                                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: getStationColor(booking.station) }}
                                                    ></span>
                                                    <span className="font-display text-white font-bold uppercase text-sm">
                                                        {booking.station}
                                                    </span>
                                                </div>
                                                <div className="text-white/60 text-sm">
                                                    {formatDate(booking.date)} at {formatTime(booking.time)}
                                                </div>
                                                <div className="text-white/40 text-xs mt-1">
                                                    {booking.drivers} driver{booking.drivers > 1 ? 's' : ''} • ID: {booking.id}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cancel Button */}
                                        <button
                                            onClick={() => handleCancelBooking(booking.id)}
                                            disabled={cancellingId === booking.id}
                                            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 border border-[#D42428]/30 text-[#D42428] rounded-lg hover:bg-[#D42428]/10 transition-colors text-sm disabled:opacity-50"
                                        >
                                            {cancellingId === booking.id ? (
                                                'Cancelling...'
                                            ) : (
                                                <>
                                                    <X className="w-4 h-4" />
                                                    Cancel
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                <p className="text-white/60 mb-4">No upcoming bookings</p>
                                <Link
                                    to="/book"
                                    className="inline-flex items-center gap-2 bg-[#2D9E49] text-white px-6 py-3 rounded-full font-display uppercase tracking-widest font-bold text-xs hover:bg-[#248a3f] transition-colors"
                                >
                                    Book a Session <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking History */}
                {historyList.length > 0 && (
                    <div className="mt-12 opacity-80 hover:opacity-100 transition-opacity">
                        <h2 className="font-display text-lg font-bold text-white/40 uppercase mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Booking History
                        </h2>
                        <div className="bg-[#141414]/50 rounded-2xl p-6 border border-white/5">
                            <div className="space-y-4">
                                {historyList.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/20 rounded-xl"
                                    >
                                        <div className="flex items-start gap-4 opacity-60">
                                            {/* Date/Time */}
                                            <div className="text-center min-w-[60px]">
                                                <div className="text-xl font-bold text-white">
                                                    {new Date(booking.date).getUTCDate()}
                                                </div>
                                                <div className="text-xs text-white/60 uppercase">
                                                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span
                                                        className="w-2 h-2 rounded-full bg-white/40"
                                                    ></span>
                                                    <span className="font-display text-white font-bold uppercase text-sm">
                                                        {booking.station}
                                                    </span>
                                                </div>
                                                <div className="text-white/60 text-sm">
                                                    {formatDate(booking.date)} at {formatTime(booking.time)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 sm:mt-0 text-white/20 text-xs font-mono">
                                            COMPLETED
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Edit Profile Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-lg relative">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="font-display text-xl font-bold uppercase text-white mb-6">Edit Driver Profile</h2>

                        {saveError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                                {saveError}
                            </div>
                        )}

                        <form onSubmit={handleSaveProfile} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Fav Discipline</label>
                                    <input
                                        type="text"
                                        value={editFormData.favDiscipline}
                                        onChange={(e) => setEditFormData({ ...editFormData, favDiscipline: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#2D9E49] outline-none"
                                        placeholder="e.g. GT3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Fav Track</label>
                                    <input
                                        type="text"
                                        value={editFormData.favTrack}
                                        onChange={(e) => setEditFormData({ ...editFormData, favTrack: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#2D9E49] outline-none"
                                        placeholder="e.g. Spa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Fav Car</label>
                                    <input
                                        type="text"
                                        value={editFormData.favCar}
                                        onChange={(e) => setEditFormData({ ...editFormData, favCar: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#2D9E49] outline-none"
                                        placeholder="e.g. Ferrari 296"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Fav Rig</label>
                                    <input
                                        type="text"
                                        value={editFormData.favRig}
                                        onChange={(e) => setEditFormData({ ...editFormData, favRig: e.target.value })}
                                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#2D9E49] outline-none"
                                        placeholder="e.g. Motion"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Settings / Notes</label>
                                <textarea
                                    value={editFormData.settings}
                                    onChange={(e) => setEditFormData({ ...editFormData, settings: e.target.value })}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#2D9E49] outline-none resize-none"
                                    rows={3}
                                    placeholder="Force feedback preferences, etc."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-white/60 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-[#2D9E49] text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#248a3f] transition-colors disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : (
                                        <>
                                            <Save className="w-3 h-3" /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
