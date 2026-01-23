import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { bookingConfig } from '../config/booking';

const CancelPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const bookingId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    // Fetch booking details
    useEffect(() => {
        if (!bookingId) {
            setError('No booking ID provided');
            setLoading(false);
            return;
        }

        const fetchBooking = async () => {
            try {
                const url = `${bookingConfig.API_URL}?action=getBooking&id=${bookingId}`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.success && data.booking) {
                    setBooking(data.booking);
                    if (data.booking.status === 'Cancelled') {
                        setCancelled(true);
                    }
                } else {
                    setError(data.error || 'Booking not found');
                }
            } catch (err) {
                setError('Failed to fetch booking details');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // Handle cancellation
    const handleCancel = async () => {
        if (!bookingId) return;

        setCancelling(true);
        try {
            const url = `${bookingConfig.API_URL}?action=cancel&id=${bookingId}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setCancelled(true);
            } else {
                setError(data.error || 'Failed to cancel booking');
            }
        } catch (err) {
            setError('Failed to cancel booking');
        } finally {
            setCancelling(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#2D9E49] mx-auto mb-4" />
                    <p className="text-white/60">Loading booking details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !booking) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <XCircle className="w-16 h-16 text-[#D42428] mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Booking Not Found</h1>
                    <p className="text-white/60 mb-8">{error}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D9E49] text-white rounded-full font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Cancelled state
    if (cancelled) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <CheckCircle className="w-16 h-16 text-[#2D9E49] mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-4">Booking Cancelled</h1>
                    <p className="text-white/60 mb-2">Your booking has been successfully cancelled.</p>
                    <p className="text-white/40 text-sm mb-8">A confirmation email has been sent to {booking?.email}</p>

                    <div className="flex flex-col gap-4">
                        <Link
                            to="/book"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D42428] text-white rounded-full font-bold"
                        >
                            Book Again
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Confirmation state
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 py-20">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <AlertTriangle className="w-16 h-16 text-[#D42428] mx-auto mb-6" />
                    <h1 className="text-3xl font-bold mb-2">Cancel Booking?</h1>
                    <p className="text-white/60">Are you sure you want to cancel this booking?</p>
                </div>

                {/* Booking Details Card */}
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-white/40">Booking ID</span>
                            <span className="font-mono font-bold">{booking.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Name</span>
                            <span>{booking.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Station</span>
                            <span>{booking.station}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Date</span>
                            <span>{booking.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Time</span>
                            <span>{booking.time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Drivers</span>
                            <span>{booking.drivers}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="w-full py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {cancelling ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            'Yes, Cancel Booking'
                        )}
                    </button>
                    <Link
                        to="/"
                        className="w-full py-4 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-colors text-center"
                    >
                        No, Keep My Booking
                    </Link>
                </div>

                {error && (
                    <p className="text-[#D42428] text-center mt-4">{error}</p>
                )}
            </div>
        </div>
    );
};

export default CancelPage;
