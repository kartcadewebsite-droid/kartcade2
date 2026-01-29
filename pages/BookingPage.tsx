import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
    Calendar, Clock, Users, Phone, ArrowRight, ArrowLeft,
    CheckCircle, CreditCard, Wallet, Info, AlertTriangle,
    Gauge, Monitor, Plane, Zap, Loader2, Shield
} from 'lucide-react';
import siteConfig from '../config/site';
import { bookingConfig, bookingApi, isApiConfigured } from '../config/booking';
import { useAuth } from '../contexts/AuthContext';
import { getEquipmentTypeFromStation } from '../config/membership';
import PayPalCheckout from '../components/PayPalCheckout';

// Station Types Configuration
const stationTypes = [
    {
        id: 'karts',
        name: 'Racing Karts',
        price: 30,
        units: 5,
        icon: <Gauge className="w-8 h-8" />,
        description: 'Perfect for kids 5+, teens, and adults under 6\'3"',
        ageReq: '5+',
        color: '#2D9E49'
    },
    {
        id: 'rigs',
        name: 'Full-Size Rigs',
        price: 40,
        units: 3,
        icon: <Monitor className="w-8 h-8" />,
        description: 'Professional direct-drive simulators for adults',
        ageReq: '10+',
        color: '#FFFFFF'
    },
    {
        id: 'motion',
        name: 'Motion Simulator',
        price: 50,
        units: 1,
        icon: <Zap className="w-8 h-8" />,
        description: 'Triple-screen with motion platform - the ultimate experience',
        ageReq: '14+',
        color: '#D42428'
    },
    {
        id: 'flight',
        name: 'Flight Simulator',
        price: 40,
        units: 1,
        icon: <Plane className="w-8 h-8" />,
        description: 'HOTAS setup for Star Wars Squadrons and more',
        ageReq: 'All ages',
        color: '#2D9E49'
    }
];

// Generate time slots
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = bookingConfig.openHour; hour < bookingConfig.closeHour; hour++) {
        slots.push(`${hour}:00`);
    }
    return slots;
};

// Simulate booked slots (demo/fallback mode)
const simulateBookings = (date: string, stationId: string) => {
    const bookings: { [key: string]: { booked: number; available: number; total: number } } = {};
    const station = stationTypes.find(s => s.id === stationId);
    const maxUnits = station?.units || 1;

    generateTimeSlots().forEach(slot => {
        // Random booking simulation for demo
        const randomBooked = Math.floor(Math.random() * (maxUnits + 1));
        bookings[slot] = {
            booked: randomBooked,
            available: maxUnits - randomBooked,
            total: maxUnits
        };
    });

    return bookings;
};

// Format date for display
const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

// Format date for API (YYYY-MM-DD)
const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Generate next 30 days
const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < bookingConfig.maxAdvanceDays; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }
    return dates;
};

const BookingPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLiveMode, setIsLiveMode] = useState(isApiConfigured());
    const { currentUser, userProfile, isAdmin, getCredits, useCredits, hasEnoughCredits } = useAuth();

    // Booking state
    const [searchParams] = useSearchParams();

    // Booking state - Initialize from URL params if available
    const [step, setStep] = useState(() => {
        const hasStation = searchParams.get('station');
        const hasDate = searchParams.get('date');
        const hasTime = searchParams.get('time');

        if (hasStation && hasDate && hasTime) return 3;
        if (hasStation && hasDate) return 2;
        return 1;
    });

    const [selectedStation, setSelectedStation] = useState<string | null>(searchParams.get('station') || null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
        const d = searchParams.get('date');
        // Handle timezone issues by treating date as local YYYY-MM-DD
        if (d) {
            const parts = d.split('-');
            return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        return null;
    });
    const [selectedTime, setSelectedTime] = useState<string | null>(searchParams.get('time') || null);
    const [drivers, setDrivers] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'now' | 'venue' | 'deposit' | 'credits' | 'paypal'>('venue');
    const [availability, setAvailability] = useState<{ [key: string]: { booked: number; available: number; total: number } }>({});
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loadingStripe, setLoadingStripe] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    // Get equipment type for credits
    const equipmentType = selectedStation ? getEquipmentTypeFromStation(selectedStation) : null;
    const availableCredits = equipmentType ? getCredits(equipmentType) : 0;
    const canUseCredits = equipmentType && hasEnoughCredits(equipmentType, drivers);

    // Auto-fill user details if logged in (but NOT for admins, so they can enter customer data)
    useEffect(() => {
        if (userProfile && currentUser && !isAdmin) {
            setFormData(prev => ({
                ...prev,
                name: userProfile.name || '',
                email: currentUser.email || '',
                phone: userProfile.phone || ''
            }));
        }
    }, [userProfile, currentUser, isAdmin]);

    // Dates for calendar
    const dates = generateDates();
    const timeSlots = generateTimeSlots();

    // Load availability when date/station changes
    useEffect(() => {
        if (selectedDate && selectedStation) {
            loadAvailability();
        }
    }, [selectedDate, selectedStation]);

    // Fetch availability from API or use demo data
    const loadAvailability = async () => {
        if (!selectedDate || !selectedStation) return;

        setIsLoadingAvailability(true);
        setError(null);

        const dateStr = formatDateForApi(selectedDate);

        if (isLiveMode) {
            // Try to fetch from real API
            try {
                const response = await bookingApi.getAvailability(dateStr, selectedStation);
                if (response && response.availability) {
                    setAvailability(response.availability);
                } else {
                    // Fall back to demo mode
                    setAvailability(simulateBookings(dateStr, selectedStation));
                }
            } catch (err) {
                console.error('API error, falling back to demo:', err);
                setAvailability(simulateBookings(dateStr, selectedStation));
            }
        } else {
            // Demo mode
            setAvailability(simulateBookings(dateStr, selectedStation));
        }

        setIsLoadingAvailability(false);
    };

    // Calculate available units for selected time
    const getAvailableUnits = (time: string) => {
        const slot = availability[time];
        if (slot) {
            return slot.available;
        }
        // Fallback to station max
        const station = stationTypes.find(s => s.id === selectedStation);
        return station?.units || 1;
    };

    // Get station info
    const selectedStationData = stationTypes.find(s => s.id === selectedStation);

    useGSAP(() => {
        gsap.fromTo(".booking-step",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
        );
    }, [step]);

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !selectedStation) return;

        // NEW: If Deposit selected, open the "Choose Method" modal instead of submitting immediately
        if (paymentMethod === 'deposit') {
            setShowPaymentModal(true);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // If paying with credits, deduct them first
            if (paymentMethod === 'credits' && equipmentType) {
                const creditsUsed = await useCredits(equipmentType, drivers);
                if (!creditsUsed) {
                    setError('Failed to use credits. Please try again or choose a different payment method.');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Construct notes with credit info AND driver specs
            let finalNotes = formData.notes;

            // Add credit info if applicable
            if (paymentMethod === 'credits') {
                finalNotes += ` [Paid with ${drivers} credit(s)]`;
            }

            // Add Driver Tech Specs (for Adam's reference)
            if (userProfile) {
                const specs: string[] = [];
                if (userProfile.favCar) specs.push(`Car: ${userProfile.favCar}`);
                if (userProfile.favTrack) specs.push(`Track: ${userProfile.favTrack}`);
                if (userProfile.favRig) specs.push(`Rig: ${userProfile.favRig}`);
                if (userProfile.settings) specs.push(`Settings: ${userProfile.settings}`);

                if (specs.length > 0) {
                    finalNotes += ` \n[DRIVER SPECS: ${specs.join(' | ')}]`;
                }
            }

            const result = await bookingApi.createBooking({
                date: formatDateForApi(selectedDate),
                time: selectedTime,
                station: selectedStation,
                drivers: drivers,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                paymentMethod: paymentMethod === 'credits' ? 'credits' : paymentMethod,
                notes: finalNotes
            });

            if (result.success) {
                setBookingId(result.bookingId);
                setIsComplete(true);
            } else {
                setError(result.error || 'Failed to create booking');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }

        setIsSubmitting(false);
    };

    // Handle Stripe Deposit (Redirect to Checkout)
    const handleStripeDeposit = async () => {
        if (!currentUser) return alert('Please login to pay');

        setLoadingStripe(true);
        try {
            const depositAmount = calculateTotal() / 2 * 100; // 50% in cents

            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    userEmail: currentUser.email,
                    amount: depositAmount, // Custom Amount
                    mode: 'payment',
                    productName: `50% Deposit: ${selectedStationData?.name} (${formatDate(selectedDate!)})`,
                    // Pass booking details for Webhook Fulfillment
                    bookingDetails: {
                        station: selectedStation,
                        date: formatDateForApi(selectedDate!),
                        time: selectedTime,
                        drivers: drivers,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        notes: formData.notes
                    }
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Stripe Error: ' + data.error);
                setLoadingStripe(false);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to connect to Stripe');
            setLoadingStripe(false);
        }
    };

    const handlePayPalSuccess = async (details: any) => {
        console.log('PayPal Success:', details);
        setIsSubmitting(true);
        setError(null);

        try {
            // Construct notes with PayPal info
            let finalNotes = formData.notes;
            const isDeposit = paymentMethod === 'deposit';
            finalNotes += isDeposit
                ? ` [PAID 50% DEPOSIT via PayPal: ${details.id}]`
                : ` [Paid via PayPal: ${details.id}]`;

            // Add Driver Tech Specs
            if (userProfile) {
                const specs: string[] = [];
                if (userProfile.favCar) specs.push(`Car: ${userProfile.favCar}`);
                if (userProfile.favTrack) specs.push(`Track: ${userProfile.favTrack}`);
                if (userProfile.favRig) specs.push(`Rig: ${userProfile.favRig}`);
                if (userProfile.settings) specs.push(`Settings: ${userProfile.settings}`);

                if (specs.length > 0) {
                    finalNotes += ` \n[DRIVER SPECS: ${specs.join(' | ')}]`;
                }
            }

            const result = await bookingApi.createBooking({
                date: formatDateForApi(selectedDate!),
                time: selectedTime!,
                station: selectedStation!,
                drivers: drivers,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                paymentMethod: 'paypal',
                notes: finalNotes
            });

            if (result.success) {
                setBookingId(result.bookingId);
                setIsComplete(true);
            } else {
                setError(result.error || 'Booking created, but failed to save details. Please contact us.');
            }
        } catch (err) {
            setError('Payment successful, but booking failed to save. Please contact us with your Transaction ID: ' + details.id);
        }
        setIsSubmitting(false);
    };

    // Calculate total
    const calculateTotal = () => {
        if (!selectedStationData) return 0;
        return selectedStationData.price * drivers;
    };

    return (
        <div ref={containerRef} className="bg-[#0A0A0A] text-white min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-28 pb-8 px-6 md:px-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#D42428]/10 to-transparent"></div>

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <span className="block text-[#2D9E49] text-xs font-bold uppercase tracking-widest mb-4">
                        Reserve Your Session
                    </span>
                    <h1 className="font-display text-4xl md:text-6xl font-bold uppercase leading-none mb-4">
                        Book <span className="text-[#D42428]">Now</span>
                    </h1>

                    {/* Mode Indicator */}
                    {!isLiveMode && (
                        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-full text-sm mb-4">
                            <AlertTriangle className="w-4 h-4" />
                            Demo Mode - API not configured
                        </div>
                    )}

                    {/* Admin Mode Indicator */}
                    {isAdmin && (
                        <div className="inline-flex items-center gap-2 bg-[#D42428]/10 border border-[#D42428]/30 text-[#D42428] px-4 py-2 rounded-full text-sm mb-4 ml-2">
                            <Shield className="w-4 h-4" />
                            Admin Mode - Pay at Venue enabled
                        </div>
                    )}

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s
                                    ? 'bg-[#2D9E49] text-white'
                                    : 'bg-white/10 text-white/40'
                                    }`}>
                                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                                </div>
                                {s < 4 && (
                                    <div className={`w-12 md:w-20 h-1 mx-1 transition-all ${step > s ? 'bg-[#2D9E49]' : 'bg-white/10'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center gap-4 md:gap-12 mt-3 text-xs text-white/40 uppercase tracking-wider">
                        <span className={step >= 1 ? 'text-white' : ''}>Station</span>
                        <span className={step >= 2 ? 'text-white' : ''}>Date & Time</span>
                        <span className={step >= 3 ? 'text-white' : ''}>Details</span>
                        <span className={step >= 4 ? 'text-white' : ''}>Confirm</span>
                    </div>
                </div>
            </section>

            {/* Booking Steps */}
            <section className="py-8 px-6 md:px-12">
                <div className="max-w-4xl mx-auto">

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Success Screen */}
                    {isComplete ? (
                        <div className="booking-step text-center py-16">
                            <div className="w-24 h-24 bg-[#2D9E49] rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="font-display text-4xl font-bold uppercase mb-4">Booking Confirmed!</h2>
                            <p className="text-white/60 text-lg mb-2">
                                Your booking ID: <span className="text-[#2D9E49] font-bold">{bookingId}</span>
                            </p>
                            <p className="text-white/40 text-sm mb-8">
                                {isLiveMode ? 'Check your email for confirmation details.' : 'Demo mode - no email sent'}
                            </p>

                            <div className="bg-[#141414] border border-white/10 rounded-2xl p-8 max-w-md mx-auto mb-8">
                                <div className="space-y-4 text-left">
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Station</span>
                                        <span className="font-medium">{selectedStationData?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Date</span>
                                        <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Time</span>
                                        <span className="font-medium">{selectedTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/50">Drivers</span>
                                        <span className="font-medium">{drivers}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-white/10 pt-4">
                                        <span className="text-white/50">Total</span>
                                        <span className="font-bold text-[#2D9E49] text-xl">${calculateTotal()}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-white/40 text-sm mb-8">
                                {paymentMethod === 'venue' && 'Payment will be collected at the venue.'}
                                {paymentMethod === 'now' && 'You\'ll receive a payment link shortly.'}
                                {paymentMethod === 'deposit' && 'Deposit of $' + Math.round(calculateTotal() / 2) + ' will be charged.'}
                            </p>

                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-white/90 transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Select Station */}
                            {step === 1 && (
                                <div className="booking-step">
                                    <h2 className="font-display text-2xl font-bold uppercase mb-8 text-center">
                                        Choose Your Station
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {stationTypes.map((station) => (
                                            <button
                                                key={station.id}
                                                onClick={() => setSelectedStation(station.id)}
                                                className={`p-6 rounded-2xl border text-left transition-all hover:scale-[1.02] ${selectedStation === station.id
                                                    ? 'border-[#2D9E49] bg-[#2D9E49]/10'
                                                    : 'border-white/10 bg-[#141414] hover:border-white/30'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div style={{ color: station.color }}>{station.icon}</div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-display text-lg font-bold uppercase">{station.name}</h3>
                                                            <span className="text-[#2D9E49] font-bold">${station.price}/hr</span>
                                                        </div>
                                                        <p className="text-white/50 text-sm mb-3">{station.description}</p>
                                                        <div className="flex items-center gap-4 text-xs">
                                                            <span className="bg-white/10 px-3 py-1 rounded-full">{station.units} available</span>
                                                            <span className="text-white/40">Ages {station.ageReq}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex justify-end mt-8">
                                        <button
                                            onClick={() => selectedStation && setStep(2)}
                                            disabled={!selectedStation}
                                            className="flex items-center gap-3 px-10 py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Select Date & Time */}
                            {step === 2 && (
                                <div className="booking-step">
                                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6">
                                        <ArrowLeft className="w-4 h-4" /> Back to stations
                                    </button>

                                    <h2 className="font-display text-2xl font-bold uppercase mb-8 text-center">
                                        Select Date & Time
                                    </h2>

                                    {/* Date Picker */}
                                    <div className="mb-8">
                                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-4">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Select Date
                                        </label>
                                        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                                            {dates.slice(0, 14).map((date, i) => {
                                                const isSelected = selectedDate?.toDateString() === date.toDateString();
                                                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                                const dayNum = date.getDate();

                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            setSelectedDate(date);
                                                            setSelectedTime(null);
                                                            setDrivers(1);
                                                        }}
                                                        className={`flex-shrink-0 w-16 py-4 rounded-xl text-center transition-all ${isSelected
                                                            ? 'bg-[#2D9E49] text-white'
                                                            : 'bg-[#141414] border border-white/10 hover:border-white/30'
                                                            }`}
                                                    >
                                                        <div className="text-xs text-white/50">{dayName}</div>
                                                        <div className="text-xl font-bold">{dayNum}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Time Slots */}
                                    {selectedDate && (
                                        <div className="mb-8">
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-4">
                                                <Clock className="w-4 h-4 inline mr-2" />
                                                Available Time Slots - {formatDate(selectedDate)}
                                            </label>

                                            {isLoadingAvailability ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="w-8 h-8 animate-spin text-[#2D9E49]" />
                                                    <span className="ml-3 text-white/50">Loading availability...</span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                    {timeSlots.map((time) => {
                                                        const available = getAvailableUnits(time);
                                                        const isSelected = selectedTime === time;

                                                        // Check if time is in the past (Oregon Time)
                                                        const now = new Date();
                                                        // Convert current browser time to Oregon time
                                                        const oregonNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));

                                                        // Check if selected date matches Oregon's today
                                                        const isToday = selectedDate?.getDate() === oregonNow.getDate() &&
                                                            selectedDate?.getMonth() === oregonNow.getMonth() &&
                                                            selectedDate?.getFullYear() === oregonNow.getFullYear();

                                                        const slotHour = parseInt(time.split(':')[0]);
                                                        const currentHour = oregonNow.getHours();
                                                        const isPast = isToday && slotHour <= currentHour;

                                                        const isDisabled = available <= 0 || isPast;

                                                        return (
                                                            <button
                                                                key={time}
                                                                onClick={() => {
                                                                    if (!isDisabled) {
                                                                        setSelectedTime(time);
                                                                        setDrivers(1);
                                                                    }
                                                                }}
                                                                disabled={isDisabled}
                                                                className={`p-4 rounded-xl text-center transition-all ${isSelected
                                                                    ? 'bg-[#2D9E49] text-white'
                                                                    : isDisabled
                                                                        ? 'bg-[#1a1a1a] text-white/20 cursor-not-allowed border border-transparent'
                                                                        : 'bg-[#141414] border border-white/10 hover:border-[#2D9E49]/50'
                                                                    }`}
                                                            >
                                                                <div className="font-bold">{time}</div>
                                                                <div className={`text-xs mt-1 ${isPast ? 'text-white/20' : available <= 0 ? 'text-[#D42428]' : 'text-[#2D9E49]'}`}>
                                                                    {isPast ? 'PASSED' : available <= 0 ? 'FULL' : `${available} left`}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Number of Drivers */}
                                    {selectedTime && (
                                        <div className="mb-8">
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-4">
                                                <Users className="w-4 h-4 inline mr-2" />
                                                Number of Drivers
                                            </label>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-xl p-2 overflow-x-auto">
                                                    {[...Array(Math.min(getAvailableUnits(selectedTime), 10))].map((_, i) => (
                                                        <button
                                                            key={i + 1}
                                                            onClick={() => setDrivers(i + 1)}
                                                            className={`w-12 h-12 rounded-lg font-bold transition-all flex-shrink-0 ${drivers === i + 1
                                                                ? 'bg-[#2D9E49] text-white'
                                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-[#2D9E49]">${calculateTotal()}</div>
                                                    <div className="text-xs text-white/40">total</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between mt-8">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex items-center gap-2 px-6 py-4 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" /> Back
                                        </button>
                                        <button
                                            onClick={() => selectedDate && selectedTime && setStep(3)}
                                            disabled={!selectedDate || !selectedTime}
                                            className="flex items-center gap-3 px-10 py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Your Details */}
                            {step === 3 && (
                                <div className="booking-step">
                                    <button onClick={() => setStep(2)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6">
                                        <ArrowLeft className="w-4 h-4" /> Back to time selection
                                    </button>

                                    <h2 className="font-display text-2xl font-bold uppercase mb-8 text-center">
                                        Your Details
                                    </h2>

                                    <div className="max-w-lg mx-auto space-y-6">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors"
                                                placeholder="John Smith"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors"
                                                    placeholder="john@email.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Phone *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors"
                                                    placeholder="(503) 555-1234"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Special Requests</label>
                                            <textarea
                                                rows={3}
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-[#2D9E49] focus:outline-none transition-colors resize-none"
                                                placeholder="Any special requests, ages of drivers, games you'd like to play..."
                                            />
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-[#2D9E49]/10 border border-[#2D9E49]/30 rounded-xl">
                                            <Info className="w-5 h-5 text-[#2D9E49] flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-white/80">
                                                <p className="font-bold text-white mb-1">Tip for Groups</p>
                                                For the best experience, we recommend all drivers create a profile before arriving so we can set up their rigs with their preferences.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-8">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex items-center gap-2 px-6 py-4 border border-white/20 text-white rounded-full font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                                        >
                                            <ArrowLeft className="w-5 h-5" /> Back
                                        </button>
                                        <button
                                            onClick={() => formData.name && formData.email && formData.phone && setStep(4)}
                                            disabled={!formData.name || !formData.email || !formData.phone}
                                            className="flex items-center gap-3 px-10 py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Continue <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirm & Pay */}
                            {step === 4 && (
                                <div className="booking-step">
                                    <button onClick={() => setStep(3)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6">
                                        <ArrowLeft className="w-4 h-4" /> Back to details
                                    </button>

                                    <h2 className="font-display text-2xl font-bold uppercase mb-8 text-center">
                                        Confirm Booking
                                    </h2>

                                    <div className="max-w-lg mx-auto">
                                        {/* Booking Summary */}
                                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 mb-8">
                                            <h3 className="font-display text-lg font-bold uppercase mb-4 text-[#2D9E49]">Booking Summary</h3>

                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-white/50">Station</span>
                                                    <span className="font-medium">{selectedStationData?.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/50">Date</span>
                                                    <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/50">Time</span>
                                                    <span className="font-medium">{selectedTime} (1 hour)</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/50">Drivers</span>
                                                    <span className="font-medium">{drivers} × ${selectedStationData?.price}/hr</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-white/50">Customer</span>
                                                    <span className="font-medium">{formData.name}</span>
                                                </div>
                                                <div className="flex justify-between border-t border-white/10 pt-3 mt-3">
                                                    <span className="font-bold">Total</span>
                                                    <span className="font-bold text-[#2D9E49] text-xl">${calculateTotal()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Options */}
                                        <div className="mb-8">
                                            <h3 className="font-display text-lg font-bold uppercase mb-4">Payment Option</h3>

                                            <div className="space-y-3">
                                                {/* Use Credits - Only if user has enough */}
                                                {canUseCredits && (
                                                    <button
                                                        onClick={() => setPaymentMethod('credits')}
                                                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${paymentMethod === 'credits'
                                                            ? 'border-yellow-500 bg-yellow-500/10'
                                                            : 'border-yellow-500/30 hover:border-yellow-500/50 bg-yellow-500/5'
                                                            }`}
                                                    >
                                                        <Zap className="w-6 h-6 text-yellow-500" />
                                                        <div className="flex-1">
                                                            <div className="font-bold flex items-center gap-2 text-yellow-400">
                                                                Use {drivers} Credit{drivers > 1 ? 's' : ''}
                                                                <span className="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded-full uppercase font-bold">
                                                                    50% OFF
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-white/50">
                                                                You have {availableCredits} {equipmentType} credit{availableCredits !== 1 ? 's' : ''} available
                                                            </div>
                                                        </div>
                                                        <div className="text-yellow-400 font-bold">FREE</div>
                                                    </button>
                                                )}

                                                {/* Show credits info if not enough */}
                                                {equipmentType && availableCredits > 0 && !canUseCredits && (
                                                    <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-center gap-4">
                                                        <Zap className="w-6 h-6 text-yellow-500/50" />
                                                        <div className="flex-1">
                                                            <div className="font-bold text-white/50">
                                                                Not enough credits
                                                            </div>
                                                            <div className="text-sm text-white/40">
                                                                You have {availableCredits} but need {drivers} credits
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pay at Venue - Admin Only */}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setPaymentMethod('venue')}
                                                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${paymentMethod === 'venue'
                                                            ? 'border-[#2D9E49] bg-[#2D9E49]/10'
                                                            : 'border-white/10 hover:border-white/30'
                                                            }`}
                                                    >
                                                        <Wallet className="w-6 h-6 text-[#2D9E49]" />
                                                        <div className="flex-1">
                                                            <div className="font-bold flex items-center gap-2">
                                                                Pay at Venue
                                                                <span className="text-[10px] bg-[#D42428] text-white px-2 py-0.5 rounded-full uppercase">
                                                                    Admin
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-white/50">Pay ${calculateTotal()} when you arrive</div>
                                                        </div>
                                                    </button>
                                                )}

                                                {/* Deposit Option */}
                                                <button
                                                    onClick={() => setPaymentMethod('deposit')}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${paymentMethod === 'deposit'
                                                        ? 'border-[#D42428] bg-[#D42428]/10'
                                                        : 'border-white/10 hover:border-white/30'
                                                        }`}
                                                >
                                                    <CreditCard className="w-6 h-6 text-[#D42428]" />
                                                    <div className="flex-1">
                                                        <div className="font-bold flex items-center gap-2">
                                                            Pay Deposit
                                                            <span className="text-[10px] bg-[#D42428] text-white px-2 py-0.5 rounded-full uppercase">
                                                                Popular
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-white/50">Pay ${Math.round(calculateTotal() / 2)} now, rest at venue</div>
                                                    </div>
                                                </button>

                                                {/* PayPal */}
                                                <button
                                                    onClick={() => setPaymentMethod('paypal')}
                                                    disabled={!bookingConfig.paypalClientId}
                                                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${paymentMethod === 'paypal'
                                                        ? 'bg-[#003087]/10 border-[#003087]'
                                                        : !bookingConfig.paypalClientId
                                                            ? 'border-white/10 opacity-50 cursor-not-allowed'
                                                            : 'border-white/10 hover:border-[#003087]/50'
                                                        }`}
                                                >
                                                    <div className="w-6 h-6 flex items-center justify-center">
                                                        <span className="font-bold text-[#003087] text-lg italic">P</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold flex items-center gap-2">
                                                            PayPal
                                                            {!bookingConfig.paypalClientId && (
                                                                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">
                                                                    Not Configured
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-white/50">Pay securely with PayPal</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit or PayPal */}
                                        {paymentMethod === 'paypal' ? (
                                            <div className="mt-8">
                                                <PayPalCheckout
                                                    amount={calculateTotal()}
                                                    onSuccess={handlePayPalSuccess}
                                                    onError={(err) => setError('PayPal Error: ' + err)}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={handleSubmit}
                                                    disabled={isSubmitting}
                                                    className="w-full py-4 bg-[#D42428] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#B91C1C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            {paymentMethod === 'deposit'
                                                                ? `Pay Deposit ($${Math.round(calculateTotal() / 2)})`
                                                                : 'Confirm Booking'} <ArrowRight className="w-5 h-5" />
                                                        </>
                                                    )}
                                                </button>

                                                {/* Payment Selection Modal */}
                                                {showPaymentModal && (
                                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                                        <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
                                                            <button
                                                                onClick={() => setShowPaymentModal(false)}
                                                                className="absolute top-4 right-4 text-white/50 hover:text-white"
                                                            >
                                                                ✕
                                                            </button>

                                                            <h3 className="font-display text-xl font-bold uppercase mb-6 text-center">
                                                                Choose Payment Method
                                                            </h3>

                                                            <div className="space-y-4">
                                                                {/* Option A: Stripe */}
                                                                <button
                                                                    onClick={handleStripeDeposit}
                                                                    disabled={loadingStripe}
                                                                    className="w-full p-4 bg-[#635BFF] text-white rounded-xl font-bold hover:bg-[#5851E3] transition-colors flex items-center justify-center gap-3"
                                                                >
                                                                    {loadingStripe ? <Loader2 className="animate-spin" /> : <CreditCard />}
                                                                    Pay with Card / G-Pay
                                                                </button>

                                                                <div className="text-center text-xs text-white/30 uppercase tracking-widest">
                                                                    - or -
                                                                </div>

                                                                {/* Option B: PayPal */}
                                                                <div className="relative z-0">
                                                                    <PayPalCheckout
                                                                        amount={calculateTotal() / 2}
                                                                        onSuccess={(details) => {
                                                                            setShowPaymentModal(false);
                                                                            handlePayPalSuccess(details);
                                                                        }}
                                                                        onError={(err) => setError('PayPal Error: ' + err)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-6 text-center">
                                                    <div className="text-white/40 text-xs leading-relaxed max-w-md mx-auto">
                                                        <p className="font-bold text-white/60 mb-1 pointer-events-none">Cancellation Policy</p>
                                                        <ul className="space-y-1">
                                                            <li>• No refunds for cancellations within 48 hours of booking.</li>
                                                            <li>• 50% account credit for cancellations less than 1 week in advance.</li>
                                                            <li>• Full refund for cancellations more than 1 week in advance.</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Quick Contact */}
            <section className="py-12 px-6 md:px-12 bg-[#141414]">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-white/50 mb-4">Need help or have questions?</p>
                    <a
                        href={`tel:${siteConfig.phone}`}
                        className="inline-flex items-center gap-3 text-[#2D9E49] hover:underline font-bold"
                    >
                        <Phone className="w-5 h-5" /> {siteConfig.phone}
                    </a>
                </div>
            </section>
        </div>
    );
};

export default BookingPage;

