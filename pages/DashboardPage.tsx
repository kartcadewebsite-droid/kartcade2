import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CreditCard, Calendar, Clock, LogOut, ArrowRight, Zap, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi } from '../config/booking';

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
    const { currentUser, userProfile, logout, isAdmin } = useAuth();

    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Placeholder data - will be replaced with real Firestore data
    const membership = null;
    const credits = 0;

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
    }, [currentUser?.email]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            setCancellingId(bookingId);
            setError('');
            const response = await bookingApi.cancelBooking(bookingId);

            if (response.success) {
                // Remove from local state
                setUpcomingBookings(prev => prev.filter(b => b.id !== bookingId));
            } else {
                setError(response.error || 'Failed to cancel booking');
            }
        } catch (error) {
            setError('Failed to cancel booking. Please try again.');
        } finally {
            setCancellingId(null);
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
                        <div className="space-y-3 text-sm">
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
                                    {membership ? 'Active' : 'No active membership'}
                                </p>
                            </div>
                        </div>

                        {membership ? (
                            <div className="space-y-4">
                                {/* Credits display would go here */}
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

                        <div className="text-center py-4">
                            <div className="text-5xl font-bold text-white mb-2">{credits}</div>
                            <p className="text-white/40 text-sm">hours available</p>
                        </div>
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
                        ) : upcomingBookings.length > 0 ? (
                            <div className="space-y-4">
                                {upcomingBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Date/Time */}
                                            <div className="text-center min-w-[60px]">
                                                <div className="text-2xl font-bold text-white">
                                                    {new Date(booking.date).getDate()}
                                                </div>
                                                <div className="text-xs text-white/60 uppercase">
                                                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
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
            </div>
        </div>
    );
};

export default DashboardPage;
