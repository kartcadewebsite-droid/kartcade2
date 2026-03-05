import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Trophy, ArrowLeft, ArrowRight, Clock, CheckCircle,
    Loader2, AlertTriangle, Shield, Calendar, Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingConfig, bookingApi } from '../config/booking';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

// ── Helpers (same as BookingPage) ────────────────────────────────────────────

const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let h = bookingConfig.openHour; h < bookingConfig.closeHour; h++) {
        slots.push(`${h}:00`);
    }
    return slots;
};

const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const formatDateForApi = (date: Date) =>
    date.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });

const to12h = (time: string) => {
    const [h] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:00 ${suffix}`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const BeatTheProPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        currentUser, userProfile,
        getBtpCredits, hasBtpCooldown, useBtpCredit,
        refreshUserProfile
    } = useAuth();

    // ── State ──────────────────────────────────────────────────────────────────
    const [step, setStep] = useState<1 | 2>(1);
    const [challenge, setChallenge] = useState<any>(null);
    const [loadingChallenge, setLoadingChallenge] = useState(true);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [availability, setAvailability] = useState<Record<string, { available: number; booked: number; total: number }>>({});
    const [loadingAvail, setLoadingAvail] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const today = new Date();
    const timeSlots = generateTimeSlots();
    const btpBalance = getBtpCredits();
    const btpCooldown = hasBtpCooldown();

    // ── Equipment mapping from challenge ───────────────────────────────────────
    const equipmentMap: Record<string, { label: string; id: string }> = {
        kart: { label: 'Racing Kart', id: 'karts' },
        rig: { label: 'Full-Size Rig', id: 'rigs' },
        motion: { label: 'Motion Simulator', id: 'motion' },
        flight: { label: 'Flight Simulator', id: 'flight' },
    };

    const equipmentInfo = challenge
        ? (equipmentMap[challenge.equipment] ?? { label: challenge.equipment, id: challenge.equipment })
        : null;

    // ── Load active daily challenge ───────────────────────────────────────────
    useEffect(() => {
        const fetchChallenge = async () => {
            setLoadingChallenge(true);
            try {
                // Use local date (same as DashboardPage) — NOT Oregon timezone,
                // which would shift the date for non-US users.
                const d = new Date();
                const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                const q = query(
                    collection(db, 'competitions'),
                    where('type', '==', 'daily'),
                    where('status', '==', 'active')
                );
                const snap = await getDocs(q);
                if (!snap.empty) {
                    // Find the first competition whose date range covers today
                    // Using .reverse() to pick the LATEST active competition if multiple exist
                    const match = snap.docs.map(d => ({ id: d.id, ...d.data() })).reverse().find((comp: any) => {
                        return comp.startDate <= todayStr && comp.endDate >= todayStr;
                    });
                    if (match) {
                        setChallenge(match);
                    }
                }
            } catch (e) {
                console.error('[BTP] Failed to load challenge', e);
            } finally {
                setLoadingChallenge(false);
            }
        };
        fetchChallenge();
    }, []);

    // ── Load availability when challenge loads ────────────────────────────────
    useEffect(() => {
        if (!challenge || !equipmentInfo) return;
        const fetchAvailability = async () => {
            setLoadingAvail(true);
            try {
                const dateStr = formatDateForApi(today);
                const res = await bookingApi.getAvailability(dateStr, equipmentInfo.id, 0.5);
                if (res?.availability) setAvailability(res.availability);
            } catch (e) {
                console.error('[BTP] Availability fetch failed', e);
            } finally {
                setLoadingAvail(false);
            }
        };
        fetchAvailability();
    }, [challenge]);

    // ── Slot helpers ──────────────────────────────────────────────────────────
    const isSlotAvailable = (time: string) => {
        const slot = availability[time];
        if (!slot) return true; // Optimistic if no data yet
        return slot.available > 0;
    };

    // ── Submit booking ────────────────────────────────────────────────────────
    const handleConfirm = async () => {
        if (!selectedTime || !currentUser || !userProfile || !challenge) return;
        setIsSubmitting(true);
        setError(null);

        // Final guard — re-check cooldown
        const cooldown = hasBtpCooldown();
        if (cooldown.active) {
            setError('Your BTP cooldown is still active. Please wait before booking again.');
            setIsSubmitting(false);
            return;
        }
        if (getBtpCredits() <= 0) {
            setError('No BTP credits available.');
            setIsSubmitting(false);
            return;
        }

        try {
            // 1. Deduct BTP credit + stamp lastBtpUsedAt
            const creditUsed = await useBtpCredit();
            if (!creditUsed) {
                setError('Failed to use BTP credit. Please try again.');
                setIsSubmitting(false);
                return;
            }

            const notes = [
                `[BEAT THE PRO] Challenge: ${challenge.title || 'Daily BTP'}`,
                `Game: ${challenge.game || ''}`,
                `Track: ${challenge.track || ''}`,
                `Car: ${challenge.car || ''}`,
                `Beat: ${challenge.referenceTime || ''}`,
                `[Paid with 1 BTP Credit]`,
                userProfile.favRig ? `Fav Rig: ${userProfile.favRig}` : '',
                userProfile.settings ? `Settings: ${userProfile.settings}` : '',
            ].filter(Boolean).join(' | ');

            // 2. Create booking (same API as regular booking)
            const result = await bookingApi.createBooking({
                date: formatDateForApi(today),
                time: selectedTime,
                station: `${equipmentInfo!.label} (0.5h) [BTP]`,
                drivers: 1,
                name: userProfile.name || '',
                email: currentUser.email || '',
                phone: userProfile.phone || '',
                paymentMethod: 'btp_credit',
                notes,
            });

            if (result.success) {
                setBookingId(result.bookingId || null);

                // 3. CRM log — identical structure to regular booking
                try {
                    await addDoc(collection(db, 'transactions_log'), {
                        userId: currentUser.uid,
                        email: currentUser.email || '',
                        name: userProfile.name || '',
                        phone: userProfile.phone || '',
                        type: 'booking',
                        bookingType: 'beat_the_pro',
                        station: `${equipmentInfo!.label} (0.5h) [BTP]`,
                        equipment: { [equipmentInfo!.id]: 1 },
                        drivers: 1,
                        duration: 0.5,
                        creditsCharged: 0,
                        btpCreditUsed: 1,
                        challengeId: challenge.id,
                        challengeGame: challenge.game || '',
                        challengeTrack: challenge.track || '',
                        challengeCar: challenge.car || '',
                        challengeRef: challenge.referenceTime || '',
                        date: formatDateForApi(today),
                        time: selectedTime,
                        calculatedPrice: 0,
                        paymentMethod: 'btp_credit',
                        bookingId: result.bookingId || '',
                        status: 'confirmed',
                        createdAt: serverTimestamp(),
                    });
                } catch (logErr) {
                    console.error('[BTP CRM] Non-critical log error:', logErr);
                }

                setIsComplete(true);
            } else {
                // Refund credit if booking failed
                await refreshUserProfile();
                setError(result.error || 'Booking failed. Your credit has been refunded.');
            }
        } catch (err: any) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Guard states ──────────────────────────────────────────────────────────
    if (!currentUser || !userProfile) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
                <div className="text-center">
                    <Trophy className="w-12 h-12 text-[#FFD700]/40 mx-auto mb-4" />
                    <p className="text-white/50 mb-4">You need to be logged in to access Beat the Pro.</p>
                    <Link to="/login?redirect=/beat-the-pro" className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-full text-sm">
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    if (loadingChallenge) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin" />
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                <Trophy className="w-14 h-14 text-[#FFD700]/30 mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-white uppercase mb-2">No Active Challenge Today</h2>
                <p className="text-white/40 text-sm mb-6">Adam hasn't set today's Beat the Pro challenge yet. Check back soon!</p>
                <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white text-sm">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
            </div>
        );
    }

    if (btpCooldown.active) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                {/* Hero */}
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="w-24 h-24 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-[#FFD700]" />
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 text-[#FFD700]/70 text-[10px] font-bold uppercase tracking-widest mb-3">
                    <Trophy className="w-3.5 h-3.5" /> BTP Session Secured
                </div>
                <h2 className="font-display text-3xl font-bold text-white uppercase mb-2">You're All Set!</h2>
                <p className="text-white/50 text-sm mb-1">Your Beat the Pro slot is booked for today.</p>
                <p className="text-white/30 text-xs mb-8 max-w-xs">
                    After your session, head to your Dashboard to submit your lap time and see if you made the leaderboard.
                </p>

                {/* Next slot info */}
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 max-w-xs w-full mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-white/40" />
                        </div>
                        <div className="text-left">
                            <p className="text-white text-sm font-bold">One challenge per day</p>
                            <p className="text-white/40 text-xs">Each BTP credit grants one 30-min session</p>
                        </div>
                    </div>
                    {btpCooldown.availableAt && (
                        <div className="bg-white/5 rounded-xl px-4 py-3 text-center mt-1">
                            <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">Next slot unlocks at</p>
                            <p className="text-white font-display font-bold text-lg">
                                {btpCooldown.availableAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-white/30 text-[10px]">
                                {btpCooldown.availableAt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Link to="/dashboard" className="px-5 py-2.5 bg-white/10 text-white rounded-full text-sm font-bold hover:bg-white/20 transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/leaderboard" className="px-5 py-2.5 bg-[#FFD700] text-black rounded-full text-sm font-bold hover:bg-yellow-300 transition-colors">
                        Leaderboard
                    </Link>
                </div>
            </div>
        );
    }

    if (btpBalance <= 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                <Trophy className="w-14 h-14 text-[#FFD700]/30 mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold text-white uppercase mb-2">No BTP Credits</h2>
                <p className="text-white/40 text-sm mb-6">You need 1 BTP credit ($15) to book this session.</p>
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-[#FFD700] text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-yellow-300 transition-colors"
                >
                    Buy BTP Credit <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    // ── Success screen ────────────────────────────────────────────────────────
    if (isComplete) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-[#FFD700]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Trophy className="w-12 h-12 text-[#FFD700]" />
                </div>
                <div className="inline-flex items-center gap-2 text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-3">
                    <CheckCircle className="w-4 h-4" /> Booking Confirmed
                </div>
                <h2 className="font-display text-3xl font-bold text-white uppercase mb-2">You're In!</h2>
                <p className="text-white/60 text-sm mb-1">Your Beat the Pro session is booked for</p>
                <p className="text-white font-bold text-lg mb-1">{to12h(selectedTime!)} — {formatDate(today)}</p>
                <p className="text-white/40 text-xs mb-8">{equipmentInfo?.label} · 30 min</p>

                <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl p-5 max-w-sm w-full mb-8 text-left">
                    <p className="text-[#FFD700] text-xs font-bold uppercase tracking-widest mb-3">🎯 Your Challenge</p>
                    {challenge.game && <div className="flex justify-between text-sm mb-1"><span className="text-white/40">Game</span><span className="text-white">{challenge.game}</span></div>}
                    {challenge.track && <div className="flex justify-between text-sm mb-1"><span className="text-white/40">Track</span><span className="text-white">{challenge.track}</span></div>}
                    {challenge.car && <div className="flex justify-between text-sm mb-1"><span className="text-white/40">Car</span><span className="text-white">{challenge.car}</span></div>}
                    {challenge.referenceTime && <div className="flex justify-between text-sm"><span className="text-white/40">Beat</span><span className="text-[#FFD700] font-bold">{challenge.referenceTime}</span></div>}
                </div>

                <p className="text-white/30 text-xs mb-6">After your session, submit your lap time from your Dashboard to appear on the leaderboard.</p>

                <div className="flex gap-3">
                    <Link to="/dashboard" className="px-6 py-3 bg-white/10 text-white rounded-full text-sm font-bold hover:bg-white/20 transition-colors">
                        Dashboard
                    </Link>
                    <Link to="/leaderboard" className="px-6 py-3 bg-[#FFD700] text-black rounded-full text-sm font-bold hover:bg-yellow-300 transition-colors">
                        View Leaderboard
                    </Link>
                </div>
            </div>
        );
    }

    // ── Main flow ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0A0A] py-24 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Back link */}
                <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> {step === 1 ? 'Back' : 'Back to time selection'}
                </button>

                {/* Challenge Banner */}
                <div className="bg-gradient-to-r from-[#FFD700]/15 to-[#FFD700]/5 border border-[#FFD700]/30 rounded-2xl p-5 mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FFD700]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Trophy className="w-5 h-5 text-[#FFD700]" />
                            </div>
                            <div>
                                <div className="text-[10px] text-[#FFD700]/60 font-bold uppercase tracking-widest mb-0.5">Daily Challenge</div>
                                <h1 className="font-display font-bold text-white text-lg uppercase">Beat the Pro</h1>
                            </div>
                        </div>
                        <div className="text-right bg-[#FFD700]/10 px-3 py-2 rounded-xl flex-shrink-0">
                            <div className="text-[10px] text-[#FFD700]/50 uppercase">Beat</div>
                            <div className="text-[#FFD700] font-display font-bold">{challenge.referenceTime || '–'}</div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                            { label: 'Game', value: challenge.game },
                            { label: 'Track', value: challenge.track },
                            { label: 'Car', value: challenge.car },
                        ].map(({ label, value }) => value ? (
                            <div key={label} className="bg-black/30 rounded-lg px-3 py-2">
                                <div className="text-[9px] text-white/30 uppercase">{label}</div>
                                <div className="text-white text-xs font-medium truncate">{value}</div>
                            </div>
                        ) : null)}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-[10px] bg-[#FFD700]/20 text-[#FFD700] px-2 py-0.5 rounded-full font-bold uppercase">{equipmentInfo?.label}</span>
                        <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full uppercase">30 min session</span>
                        <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full uppercase">Today · {formatDate(today).split(',')[0]}</span>
                    </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-8">
                    {[1, 2].map(n => (
                        <div key={n} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === n ? 'bg-[#FFD700] text-black' : step > n ? 'bg-[#FFD700]/30 text-[#FFD700]' : 'bg-white/10 text-white/30'
                                }`}>{n}</div>
                            <span className={`text-xs ${step === n ? 'text-white' : 'text-white/30'}`}>
                                {n === 1 ? 'Pick a time' : 'Confirm'}
                            </span>
                            {n < 2 && <div className="w-8 h-px bg-white/10 mx-1" />}
                        </div>
                    ))}
                </div>

                {/* ── STEP 1: Time selection ──────────────────────────────── */}
                {step === 1 && (
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <Calendar className="w-5 h-5 text-white/50" />
                            <div>
                                <p className="text-white font-bold">{formatDate(today)}</p>
                                <p className="text-white/40 text-xs">Today only — challenge changes daily</p>
                            </div>
                        </div>

                        {loadingAvail ? (
                            <div className="flex items-center justify-center py-12 gap-2 text-white/30">
                                <Loader2 className="w-5 h-5 animate-spin" /> Loading availability…
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
                                {timeSlots.map(slot => {
                                    const avail = isSlotAvailable(slot);
                                    const selected = selectedTime === slot;
                                    return (
                                        <button
                                            key={slot}
                                            disabled={!avail}
                                            onClick={() => setSelectedTime(slot)}
                                            className={`py-4 rounded-xl text-sm font-bold transition-all border ${selected
                                                ? 'bg-[#FFD700] text-black border-[#FFD700] shadow-lg shadow-[#FFD700]/20 scale-105'
                                                : avail
                                                    ? 'bg-white/5 text-white border-white/10 hover:border-[#FFD700]/40 hover:bg-[#FFD700]/5'
                                                    : 'bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed line-through'
                                                }`}
                                        >
                                            {to12h(slot)}
                                            {!avail && <div className="text-[9px] font-normal mt-0.5 text-white/20">Taken</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedTime}
                            className="w-full py-4 rounded-2xl bg-[#FFD700] text-black font-display font-bold uppercase tracking-widest text-sm hover:bg-yellow-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── STEP 2: Confirm ────────────────────────────────────── */}
                {step === 2 && (
                    <div>
                        <h2 className="font-display text-xl font-bold uppercase text-white mb-6">Confirm Booking</h2>

                        {/* Summary card */}
                        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 mb-6 space-y-3">
                            <h3 className="text-xs text-white/30 uppercase font-bold tracking-widest mb-4">Booking Summary</h3>
                            {[
                                { label: 'Date', value: formatDate(today) },
                                { label: 'Time', value: `${to12h(selectedTime!)} (30 min)` },
                                { label: 'Equipment', value: equipmentInfo?.label },
                                { label: 'Driver', value: userProfile.name },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between text-sm">
                                    <span className="text-white/40">{label}</span>
                                    <span className="text-white font-medium">{value}</span>
                                </div>
                            ))}
                            {challenge.referenceTime && (
                                <div className="flex justify-between text-sm border-t border-white/10 pt-3 mt-3">
                                    <span className="text-white/40">Target to beat</span>
                                    <span className="text-[#FFD700] font-bold">{challenge.referenceTime}</span>
                                </div>
                            )}
                        </div>

                        {/* Payment */}
                        <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl p-5 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Trophy className="w-5 h-5 text-[#FFD700]" />
                                    <div>
                                        <p className="text-white font-bold text-sm">BTP Credit</p>
                                        <p className="text-white/40 text-xs">1 credit used · {btpBalance - 1} remaining after</p>
                                    </div>
                                </div>
                                <span className="text-[#FFD700] font-display font-bold text-lg">FREE</span>
                            </div>
                        </div>

                        {/* Security note */}
                        <div className="flex items-center gap-2 text-white/20 text-xs mb-6">
                            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                            All bookings sync with Google Calendar, Sheets, and our CRM.
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-red-400 text-sm">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                            </div>
                        )}

                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className="w-full py-4 rounded-2xl bg-[#FFD700] text-black font-display font-bold uppercase tracking-widest text-sm hover:bg-yellow-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                            ) : (
                                <><Zap className="w-4 h-4" /> Confirm Booking</>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BeatTheProPage;
