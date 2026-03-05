import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../config/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { Trophy, Medal, Award, ChevronUp, ChevronDown, Clock, Gauge, Monitor, Rocket, Zap, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deleteDoc, doc } from 'firebase/firestore';

// ─── Types ──────────────────────────────────────────────────────────────────

interface LapTime {
    id: string;
    userId: string;
    driverName: string;
    photoURL: string;
    isPro?: boolean;
    equipment: 'karts' | 'rigs' | 'motion' | 'flight';
    game: string;
    track: string;
    car: string;
    lapTime: string;
    lapTimeMs: number;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Timestamp;
    competitionWins?: { daily: number; weekly: number; monthly: number; total: number };
}

interface Competition {
    id: string;
    type: 'daily' | 'weekly' | 'monthly';
    equipment: string;
    game: string;
    track: string;
    car: string;
    referenceTime: string;
    referenceTimeMs: number;
    setByName: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed';
    creditReward: number;
}

type CompetitionFilter = 'all' | 'daily' | 'weekly' | 'monthly';
type EquipmentFilter = 'all' | 'karts' | 'rigs' | 'motion' | 'flight';
type SortKey = 'lapTimeMs' | 'driverName' | 'equipment' | 'game';
type SortDir = 'asc' | 'desc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EQUIPMENT_LABELS: Record<string, string> = {
    karts: 'Racing Karts',
    rigs: 'Full-Size Rigs',
    motion: 'Motion Simulator',
    flight: 'Flight Simulator'
};

const EQUIPMENT_COLORS: Record<string, string> = {
    karts: '#2D9E49',
    rigs: '#FFFFFF',
    motion: '#D42428',
    flight: '#2D9E49'
};

const EquipmentIcon = ({ type, size = 14 }: { type: string; size?: number }) => {
    const props = { size, className: 'inline' };
    if (type === 'karts') return <Zap {...props} />;
    if (type === 'rigs') return <Monitor {...props} />;
    if (type === 'motion') return <Rocket {...props} />;
    if (type === 'flight') return <Gauge {...props} />;
    return <Gauge {...props} />;
};

function getPeriodBounds(type: CompetitionFilter): { start: Date; end: Date } | null {
    if (type === 'all') return null;
    const now = new Date();
    let start: Date, end: Date;

    if (type === 'daily') {
        start = new Date(now); start.setHours(0, 0, 0, 0);
        end = new Date(now); end.setHours(23, 59, 59, 999);
    } else if (type === 'weekly') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(now.setDate(diff)); start.setHours(0, 0, 0, 0);
        end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
    } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    return { start, end };
}

// ─── Component ───────────────────────────────────────────────────────────────

const LeaderboardPage: React.FC = () => {
    const { isAdmin, currentUser, getBtpCredits, hasBtpCooldown } = useAuth();
    const [allTimes, setAllTimes] = useState<LapTime[]>([]);
    const [competitions, setCompetitions] = useState<Competition[]>([]);
    const [loading, setLoading] = useState(true);

    const [competitionFilter, setCompetitionFilter] = useState<CompetitionFilter>('all');
    const [sortKey, setSortKey] = useState<SortKey>('lapTimeMs');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    // Cascade filter state
    const [filterGame, setFilterGame] = useState<string>('');
    const [filterTrack, setFilterTrack] = useState<string>('');
    const [filterCar, setFilterCar] = useState<string>('');

    // ── Live data fetch ────────────────────────────────────────────────────
    useEffect(() => {
        const q = query(
            collection(db, 'lap_times'),
            where('status', '==', 'approved')
        );

        const unsub = onSnapshot(q, (snap) => {
            const times = snap.docs.map(d => ({ id: d.id, ...d.data() } as LapTime));
            // Sort locally to ensure premium responsiveness and bypass index requirements
            times.sort((a, b) => a.lapTimeMs - b.lapTimeMs);
            setAllTimes(times);
            setLoading(false);
        }, (err) => {
            console.error('[Leaderboard] Listener error:', err);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, 'competitions'),
            where('status', '==', 'active')
        );

        const unsub = onSnapshot(q, (snap) => {
            const comps = snap.docs.map(d => ({ id: d.id, ...d.data() } as Competition));
            // Sort locally
            comps.sort((a, b) => {
                const dateA = new Date(a.startDate).getTime();
                const dateB = new Date(b.startDate).getTime();
                return dateB - dateA;
            });
            setCompetitions(comps);
        });

        return () => unsub();
    }, []);

    // ── Cascade filter options (derived from live data) ───────────────────
    const allGames = [...new Set(allTimes.map(t => t.game).filter(Boolean))].sort();
    const tracksForGame = [...new Set(allTimes.filter(t => t.game === filterGame).map(t => t.track).filter(Boolean))].sort();
    const carsForTrack = [...new Set(allTimes.filter(t => t.game === filterGame && t.track === filterTrack).map(t => t.car).filter(Boolean))].sort();

    // ── Filtering ─────────────────────────────────────────────────────────
    const filteredTimes = allTimes.filter(t => {
        // Cascade filter — only show table if game + track are both selected
        if (!filterGame || !filterTrack) return false;
        if (t.game !== filterGame) return false;
        if (t.track !== filterTrack) return false;
        if (filterCar && t.car !== filterCar) return false;

        // Period filter
        if (competitionFilter !== 'all') {
            const bounds = getPeriodBounds(competitionFilter);
            if (bounds && t.submittedAt) {
                const ts = t.submittedAt instanceof Timestamp
                    ? t.submittedAt.toDate()
                    : new Date(t.submittedAt as any);
                if (ts < bounds.start || ts > bounds.end) return false;
            }
        }
        return true;
    });

    // ── Sorting ───────────────────────────────────────────────────────────
    const sorted = [...filteredTimes].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined || valB === undefined) return 0;

        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortDir === 'asc'
            ? (valA as number) - (valB as number)
            : (valB as number) - (valA as number);
    });

    const toggleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const handleDeleteLapTime = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this lap time? This cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'lap_times', id));
        } catch (err) {
            console.error('Delete failed:', err);
            window.alert('Failed to delete. Check permissions.');
        }
    };

    const SortIcon = ({ k }: { k: SortKey }) => {
        if (sortKey !== k) return <ChevronUp size={12} className="opacity-20 inline ml-1" />;
        return sortDir === 'asc'
            ? <ChevronUp size={12} className="text-[#2D9E49] inline ml-1" />
            : <ChevronDown size={12} className="text-[#2D9E49] inline ml-1" />;
    };

    // ── Active competition per type (with date range check) ────────────────
    const getLocalToday = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const todayStr = getLocalToday();

    const findActive = (type: 'daily' | 'weekly' | 'monthly') => {
        return competitions.find(c =>
            c.type === type &&
            c.status === 'active' &&
            c.startDate <= todayStr &&
            c.endDate >= todayStr
        );
    };

    const activeDaily = findActive('daily');
    const activeWeekly = findActive('weekly');
    const activeMonthly = findActive('monthly');

    const heroCards = [
        {
            type: 'daily' as CompetitionFilter,
            label: 'Beat the Pro',
            subLabel: activeDaily
                ? `Can you beat ${activeDaily.setByName}'s ${activeDaily.referenceTime}?`
                : 'No active challenge today',
            icon: Trophy,
            comp: activeDaily,
            glowColor: '#FFD700',
            borderColor: 'border-[#FFD700]/40',
            bgGlow: 'from-[#FFD700]/10',
            iconColor: 'text-[#FFD700]',
            reward: '1 Credit',
        },
        {
            type: 'weekly' as CompetitionFilter,
            label: 'Weekly Challenge',
            subLabel: activeWeekly
                ? `Beat ${activeWeekly.referenceTime} to win 3 credits`
                : 'No active challenge this week',
            icon: Medal,
            comp: activeWeekly,
            glowColor: '#C0C0C0',
            borderColor: 'border-[#C0C0C0]/40',
            bgGlow: 'from-[#C0C0C0]/10',
            iconColor: 'text-[#C0C0C0]',
            reward: '3 Credits',
        },
        {
            type: 'monthly' as CompetitionFilter,
            label: 'Monthly Challenge',
            subLabel: activeMonthly
                ? `Beat ${activeMonthly.referenceTime} to win 5 credits`
                : 'No active challenge this month',
            icon: Award,
            comp: activeMonthly,
            glowColor: '#CD7F32',
            borderColor: 'border-[#CD7F32]/40',
            bgGlow: 'from-[#CD7F32]/10',
            iconColor: 'text-[#CD7F32]',
            reward: '5 Credits',
        },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <div className="h-20" />

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">

                {/* ── Page Header ── */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-[#2D9E49]/10 border border-[#2D9E49]/30 rounded-full px-4 py-1 mb-4">
                        <Trophy size={14} className="text-[#2D9E49]" />
                        <span className="text-xs uppercase tracking-widest text-[#2D9E49] font-bold">Kartcade Racing</span>
                    </div>
                    <h1 className="font-display text-5xl md:text-6xl font-bold uppercase mb-4 tracking-tight">
                        Fastest<br />
                        <span className="text-[#2D9E49]">Lap Times</span>
                    </h1>
                    <p className="text-white/50 max-w-xl mx-auto">
                        Beat the reference time to win free credits. Daily, weekly &amp; monthly prizes up for grabs.
                    </p>
                </div>

                {/* ── Layer 1: Hero Competition Cards ── */}
                <div className="grid md:grid-cols-3 gap-5 mb-10">
                    {heroCards.map(({ type, label, subLabel, icon: Icon, comp, borderColor, bgGlow, iconColor, reward, glowColor }) => {
                        const isActive = competitionFilter === type;
                        return (
                            <button
                                key={type}
                                onClick={() => setCompetitionFilter(isActive ? 'all' : type)}
                                className={`relative group rounded-2xl border-2 p-6 text-left transition-all duration-300 overflow-hidden
                                    ${isActive
                                        ? `${borderColor} bg-gradient-to-br ${bgGlow} to-transparent`
                                        : 'border-white/10 bg-[#141414] hover:border-white/25'
                                    }`}
                                style={isActive ? { boxShadow: `0 0 40px ${glowColor}25` } : {}}
                            >
                                {/* Glow pulse when active */}
                                {isActive && (
                                    <div
                                        className="absolute inset-0 rounded-2xl opacity-20 animate-pulse"
                                        style={{ background: `radial-gradient(circle at 30% 30%, ${glowColor}40, transparent 70%)` }}
                                    />
                                )}

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <Icon size={32} className={`${iconColor} ${isActive ? '' : 'opacity-40 group-hover:opacity-70'} transition-opacity`} />
                                        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${isActive ? `${iconColor} ${borderColor}` : 'text-white/30 border-white/10'}`}>
                                            Prize: {reward}
                                        </span>
                                    </div>

                                    <h3 className={`font-display text-xl font-bold uppercase mb-1 ${isActive ? iconColor : 'text-white'}`}>
                                        {label}
                                    </h3>
                                    {subLabel && (
                                        <p className={`text-xs mb-2 ${isActive ? 'text-white/70' : 'text-white/30'}`}>{subLabel}</p>
                                    )}

                                    {comp ? (
                                        <div className="space-y-1">
                                            <div className="text-xs text-white/50">
                                                <span className="text-white/70">Beat:</span> {comp.referenceTime}
                                                <span className="ml-2 text-white/30">by {comp.setByName}</span>
                                            </div>
                                            <div className="text-xs text-white/40">
                                                {EQUIPMENT_LABELS[comp.equipment] || comp.equipment} · {comp.track} · {comp.car}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-white/30">No active competition</p>
                                    )}

                                    {/* ── Smart BTP CTA — daily card only ── */}
                                    {type === 'daily' && (
                                        <div className="mt-4" onClick={e => e.stopPropagation()}>
                                            {(() => {
                                                // Not logged in
                                                if (!currentUser) return (
                                                    <a href="/login?redirect=/beat-the-pro"
                                                        className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/20 transition-colors">
                                                        Login to Participate
                                                    </a>
                                                );

                                                const balance = getBtpCredits();
                                                const cooldown = hasBtpCooldown();

                                                // PRIORITIZE COOLDOWN check (User has a booking secured)
                                                if (cooldown.active) return (
                                                    <div className="space-y-1.5">
                                                        <a href="/dashboard"
                                                            className="flex items-center justify-center gap-2 w-full py-2 bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-colors">
                                                            Submit Your Lap Time
                                                        </a>
                                                        <p className="text-[9px] text-white/25 text-center">Session booked! Record your time and submit from Dashboard</p>
                                                    </div>
                                                );

                                                // THEN check balance (No credit, no booking)
                                                if (balance <= 0) return (
                                                    <div className="space-y-1.5">
                                                        <a href="/dashboard"
                                                            className="flex items-center justify-center gap-2 w-full py-2 bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-colors">
                                                            Buy BTP Credit · $15
                                                        </a>
                                                        <p className="text-[9px] text-white/25 text-center">Buy a credit to book your challenge slot</p>
                                                    </div>
                                                );

                                                // Has credit, no cooldown — ready to book
                                                return (
                                                    <div className="space-y-1.5">
                                                        <a href="/beat-the-pro"
                                                            className="flex items-center justify-center gap-2 w-full py-2 bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-yellow-300 transition-colors">
                                                            Book Today's Session →
                                                        </a>
                                                        <p className="text-[9px] text-white/25 text-center">{balance} BTP credit{balance > 1 ? 's' : ''} ready · 30-min slot</p>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* ── Layer 2: Cascade Filter Dropdowns ── */}
                <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 mb-6">
                    <p className="text-xs uppercase tracking-widest text-white/30 mb-4 font-bold">Filter Lap Times</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Game */}
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Game *</label>
                            <select
                                value={filterGame}
                                onChange={e => { setFilterGame(e.target.value); setFilterTrack(''); setFilterCar(''); }}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#2D9E49] focus:outline-none transition-colors appearance-none cursor-pointer"
                            >
                                <option value="">Select a game...</option>
                                {allGames.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        {/* Track */}
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Track *</label>
                            <select
                                value={filterTrack}
                                onChange={e => { setFilterTrack(e.target.value); setFilterCar(''); }}
                                disabled={!filterGame}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#2D9E49] focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="">{filterGame ? 'Select a track...' : 'Select a game first'}</option>
                                {tracksForGame.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Car (optional) */}
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-white/30 mb-1.5">Car <span className="text-white/20">(optional)</span></label>
                            <select
                                value={filterCar}
                                onChange={e => setFilterCar(e.target.value)}
                                disabled={!filterTrack}
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-[#2D9E49] focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="">All cars</option>
                                {carsForTrack.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Row 2: period filter + count */}
                    {filterGame && filterTrack && (
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
                            <span className="text-[10px] uppercase tracking-widest text-white/20 mr-1">Period:</span>
                            {(['all', 'daily', 'weekly', 'monthly'] as CompetitionFilter[]).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setCompetitionFilter(p)}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${competitionFilter === p ? 'bg-[#2D9E49] text-white' : 'bg-white/5 text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    {p === 'all' ? 'All Time' : p}
                                </button>
                            ))}
                            <div className="ml-auto text-xs text-white/30">
                                {sorted.length} {sorted.length === 1 ? 'result' : 'results'}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Leaderboard Table ── */}
                {loading ? (
                    <div className="text-center py-20 text-white/30">Loading leaderboard...</div>
                ) : !filterGame || !filterTrack ? (
                    <div className="text-center py-20">
                        <Trophy size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="text-white/30">Select a game and track to view lap times.</p>
                        <p className="text-white/20 text-sm mt-1">Optionally filter by car to compare on a level playing field.</p>
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="text-center py-20">
                        <Trophy size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="text-white/30">No approved lap times for this selection.</p>
                        <p className="text-white/20 text-sm mt-1">Be the first to set a time on this track!</p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-white/10 overflow-hidden overflow-x-auto">
                        <div className="min-w-[960px]">
                            {/* Table Header */}
                            <div className={`grid ${isAdmin ? 'grid-cols-[40px_220px_150px_130px_120px_120px_100px_40px]' : 'grid-cols-[40px_220px_150px_130px_120px_120px_100px]'} gap-3 px-5 py-3 bg-[#141414] border-b border-white/10 text-xs uppercase tracking-widest text-white/30`}>
                                <div className="text-center">#</div>
                                <button className="text-left hover:text-white/60 transition-colors" onClick={() => toggleSort('driverName')}>
                                    Driver <SortIcon k="driverName" />
                                </button>
                                <button className="text-left hover:text-white/60 transition-colors" onClick={() => toggleSort('equipment')}>
                                    Equipment <SortIcon k="equipment" />
                                </button>
                                <button className="text-left hover:text-white/60 transition-colors" onClick={() => toggleSort('game')}>
                                    Game <SortIcon k="game" />
                                </button>
                                <div>Track</div>
                                <div>Car</div>
                                <button className="text-right hover:text-white/60 transition-colors" onClick={() => toggleSort('lapTimeMs')}>
                                    Lap Time <SortIcon k="lapTimeMs" />
                                </button>
                                {isAdmin && <div className="text-center">Action</div>}
                            </div>

                            {/* Table Rows */}
                            {sorted.map((entry, i) => {
                                const eqColor = EQUIPMENT_COLORS[entry.equipment] || '#2D9E49';
                                const wins = entry.competitionWins;
                                const isTop3 = i < 3;
                                const rankColors = ['text-[#FFD700]', 'text-[#C0C0C0]', 'text-[#CD7F32]'];

                                return (
                                    <div
                                        key={entry.id}
                                        className={`grid ${isAdmin ? 'grid-cols-[40px_220px_150px_130px_120px_120px_100px_40px]' : 'grid-cols-[40px_220px_150px_130px_120px_120px_100px]'} gap-3 px-5 py-4 items-center border-b border-white/5 transition-colors hover:bg-white/[0.02] ${isTop3 ? 'bg-white/[0.01]' : ''}`}
                                    >
                                        {/* Rank */}
                                        <div className={`font-display font-bold text-center text-lg ${isTop3 ? rankColors[i] : 'text-white/20'}`}>
                                            {i + 1}
                                        </div>

                                        {/* Driver */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            {entry.photoURL ? (
                                                <img src={entry.photoURL} alt={entry.driverName} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-white/10" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-[#141414] border border-white/10 flex items-center justify-center flex-shrink-0 text-white/30 text-xs font-bold">
                                                    {entry.driverName?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-sm truncate">{entry.driverName}</span>
                                                    {entry.isPro && (
                                                        <span className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#FFD700] text-black">
                                                            PRO
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Win badges */}
                                                {wins && wins.total > 0 && (
                                                    <div className="flex gap-1 mt-0.5 flex-wrap">
                                                        {wins.daily > 0 && (
                                                            <span className="text-[10px] text-[#FFD700] bg-[#FFD700]/10 rounded px-1 py-0.5">
                                                                🏆 {wins.daily}
                                                            </span>
                                                        )}
                                                        {wins.weekly > 0 && (
                                                            <span className="text-[10px] text-[#C0C0C0] bg-[#C0C0C0]/10 rounded px-1 py-0.5">
                                                                🥇 {wins.weekly}
                                                            </span>
                                                        )}
                                                        {wins.monthly > 0 && (
                                                            <span className="text-[10px] text-[#CD7F32] bg-[#CD7F32]/10 rounded px-1 py-0.5">
                                                                🎖️ {wins.monthly}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Equipment */}
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <EquipmentIcon type={entry.equipment} />
                                            <span className="text-xs" style={{ color: eqColor }}>
                                                {EQUIPMENT_LABELS[entry.equipment] || entry.equipment}
                                            </span>
                                        </div>

                                        {/* Game */}
                                        <div className="text-sm text-white/60 truncate">{entry.game}</div>

                                        {/* Track */}
                                        <div className="text-sm text-white/60 truncate">{entry.track}</div>

                                        {/* Car */}
                                        <div className="text-sm text-white/60 truncate">{entry.car}</div>

                                        {/* Lap Time */}
                                        <div className="text-right">
                                            <span className={`font-display font-bold text-lg ${isTop3 ? rankColors[i] : 'text-white'}`}>
                                                {entry.lapTime}
                                            </span>
                                        </div>

                                        {/* Admin Action */}
                                        {isAdmin && (
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => handleDeleteLapTime(entry.id)}
                                                    className="p-1.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete entry"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Footer CTA ── */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-white/30 text-sm">
                        <Clock size={14} />
                        <span>Log in to submit your fastest lap from your dashboard</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
