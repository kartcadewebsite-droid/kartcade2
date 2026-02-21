import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, CreditCard, Calendar, Clock, LogOut, ArrowRight, Zap, X, AlertCircle, Gauge, Monitor, Rocket, Edit2, Save, DollarSign, Camera, Trash2, Users, RefreshCw, Database, Download, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { bookingApi } from '../config/booking';
import { getMembershipById } from '../config/membership';
import { getPaymentStatus, formatCurrency } from '../utils/paymentStatus';
import { uploadProfilePhoto, deleteProfilePhoto, validatePhotoFile } from '../utils/profilePhoto';
import CustomersTable from '../components/admin/CustomersTable';
import { crmService, CustomerAnalytics } from '../services/crm';
import { exportCustomersToCSV } from '../utils/csvExport';
import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    onSnapshot,
    orderBy,
    doc,
    getDoc,
    updateDoc,
    documentId
} from 'firebase/firestore';

interface Booking {
    id: string;
    date: string;
    time: string;
    station: string;
    drivers: number;
    name: string;
    email: string;
    phone?: string;
    paymentMethod?: string;
    status: string;
}

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser, userProfile, logout, isAdmin, getCredits, updateProfile, refreshUserProfile } = useAuth();

    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState<string | null>(location.state?.message || null);
    const [error, setError] = useState<string | null>(location.state?.error || '');

    // Clear navigation state to prevent repeated alerts
    useEffect(() => {
        if (location.state?.message || location.state?.error) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Edit Profile State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        favDiscipline: '',
        favTrack: '',
        favCar: '',
        favRig: '',
        settings: '',
        phone: '', // Add phone field
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Junior Drivers State
    const [juniorDrivers, setJuniorDrivers] = useState<Array<{ name: string; photoURL?: string }>>([]);
    const [newJuniorName, setNewJuniorName] = useState('');

    // Photo Upload State
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingJuniorIndex, setUploadingJuniorIndex] = useState<number | null>(null);
    const parentPhotoInputRef = React.useRef<HTMLInputElement>(null);

    // ADMIN: Dashboard state for ALL bookings
    const [adminTodayBookings, setAdminTodayBookings] = useState<Booking[]>([]);
    const [adminUpcomingBookings, setAdminUpcomingBookings] = useState<Booking[]>([]);
    const [adminPastBookings, setAdminPastBookings] = useState<Booking[]>([]);
    const [adminStats, setAdminStats] = useState({ todayCount: 0, upcomingCount: 0, pastCount: 0 });

    // UI State for Photo Preview (Optimistic Updates)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Sync photoPreview with userProfile when it changes (initial load or background refresh)
    useEffect(() => {
        setPhotoPreview(userProfile?.photoURL || null);
    }, [userProfile?.photoURL]);
    const [adminLoading, setAdminLoading] = useState(false);
    const [adminTab, setAdminTab] = useState<'today' | 'upcoming' | 'past'>('today');
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    // CRM State
    const [adminView, setAdminView] = useState<'bookings' | 'customers' | 'parties'>('bookings');
    const [crmCustomers, setCrmCustomers] = useState<CustomerAnalytics[]>([]);
    const [crmLoading, setCrmLoading] = useState(false);

    const loadCRMData = async () => {
        setCrmLoading(true);
        try {
            const data = await crmService.getAllCustomers();
            setCrmCustomers(data);
        } catch (err) {
            console.error('CRM fetch failed:', err);
        } finally {
            setCrmLoading(false);
        }
    };
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
    const [syncCount, setSyncCount] = useState(0);

    // Admin Party State
    const [adminParties, setAdminParties] = useState<any[]>([]);
    const [adminPartiesLoading, setAdminPartiesLoading] = useState(false);
    const [adminPartyTab, setAdminPartyTab] = useState<'active' | 'archive'>('active');

    // Party Hosting State
    const [hostedParties, setHostedParties] = useState<any[]>([]);
    const [loadingParties, setLoadingParties] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Party Attending State
    const [attendingParties, setAttendingParties] = useState<any[]>([]);
    const [loadingAttendingParties, setLoadingAttendingParties] = useState(false);
    const [expandedPartyId, setExpandedPartyId] = useState<string | null>(null);

    // Equipment prices for sync calculation
    const EQUIPMENT_PRICES: Record<string, number> = { karts: 30, rigs: 40, motion: 50, flight: 40 };

    // Sync existing admin bookings to Firebase CRM
    const syncBookingsToFirebase = async () => {
        setSyncStatus('syncing');
        setSyncCount(0);
        try {
            // Combine all admin bookings
            const allBookings: Booking[] = [...adminTodayBookings, ...adminUpcomingBookings, ...adminPastBookings];
            if (allBookings.length === 0) {
                setSyncStatus('done');
                return;
            }

            // Map existing transactions for updates/skips
            const existingSnapshot = await getDocs(collection(db, 'transactions_log'));
            const existingMap = new Map(
                existingSnapshot.docs.map(doc => {
                    const d = doc.data();
                    const key = `${d.date}_${d.time}_${d.email}`.toLowerCase();
                    return [key, { id: doc.id, status: d.status }];
                })
            );

            let synced = 0;
            for (const booking of allBookings) {
                const key = `${booking.date}_${booking.time}_${booking.email}`.toLowerCase();
                const sheetStatus = booking.status === 'cancelled' ? 'cancelled' : 'confirmed';
                const existing = existingMap.get(key);

                if (existing) {
                    // Update if status changed (e.g. now cancelled in sheet)
                    if (existing.status !== sheetStatus) {
                        await updateDoc(doc(db, 'transactions_log', existing.id), {
                            status: sheetStatus,
                            updatedAt: serverTimestamp()
                        });
                        synced++;
                    }
                    continue;
                }

                // Parse station string: "Rigs:2, Karts:1 (1h)"
                const equipment: Record<string, number> = {};
                let duration = 1;
                const durationMatch = booking.station.match(/\((\d+)h\)/);
                if (durationMatch) duration = parseInt(durationMatch[1]);
                const patterns = booking.station.match(/(\w+):(\d+)/g);
                if (patterns) {
                    patterns.forEach(p => {
                        const [type, qty] = p.split(':');
                        const k = type.toLowerCase();
                        if (EQUIPMENT_PRICES[k]) equipment[k] = parseInt(qty);
                    });
                }

                // Calculate price
                let price = 0;
                for (const [type, qty] of Object.entries(equipment)) {
                    price += (EQUIPMENT_PRICES[type] || 0) * qty * duration;
                }

                await addDoc(collection(db, 'transactions_log'), {
                    userId: '',
                    email: booking.email,
                    name: booking.name,
                    phone: booking.phone || '',
                    type: 'booking',
                    station: booking.station,
                    equipment,
                    drivers: booking.drivers,
                    duration,
                    date: booking.date,
                    time: booking.time,
                    calculatedPrice: price,
                    paymentMethod: booking.paymentMethod || 'unknown',
                    bookingId: booking.id,
                    status: sheetStatus,
                    syncedFromSheet: true,
                    createdAt: serverTimestamp()
                });
                synced++;
                setSyncCount(synced);
            }

            setSyncStatus('done');
            // Refresh CRM data after sync
            const updatedCustomers = await crmService.getAllCustomers();
            setCrmCustomers(updatedCustomers);
        } catch (err) {
            console.error('[CRM Sync] Error:', err);
            setSyncStatus('error');
        }
    };

    // CRM Actions
    const handleExportCRM = () => {
        if (crmCustomers.length === 0) {
            window.alert('No customer data to export. Please sync or wait for loading.');
            return;
        }
        exportCustomersToCSV(crmCustomers);
    };

    // Get ALL active memberships from user profile
    const activeMemberships = [
        userProfile?.memberships?.kart?.active ? { ...userProfile.memberships.kart, equipmentType: 'kart' as const } : null,
        userProfile?.memberships?.rig?.active ? { ...userProfile.memberships.rig, equipmentType: 'rig' as const } : null,
        userProfile?.memberships?.motion?.active ? { ...userProfile.memberships.motion, equipmentType: 'motion' as const } : null,
    ].filter(Boolean);

    // Primary membership for display (first active one found)
    const membership = activeMemberships.length > 0 ? activeMemberships[0] : null;
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
                phone: userProfile.phone || '',
            });
            // Handle junior drivers - support both old format (with age) and new format (without age)
            const juniors = userProfile.juniorDrivers || [];
            setJuniorDrivers(juniors);
        }
    }, [userProfile, showEditModal]);

    // ADMIN: Fetch ALL bookings with auto-refresh (every 30 seconds)
    useEffect(() => {
        if (!isAdmin) return;

        const fetchAllBookings = async () => {
            try {
                setAdminLoading(true);
                const response = await bookingApi.getAllBookings();
                if (response.success) {
                    setAdminTodayBookings(response.today || []);
                    setAdminUpcomingBookings(response.upcoming || []);
                    setAdminPastBookings(response.past || []);
                    setAdminStats(response.stats || { todayCount: 0, upcomingCount: 0, pastCount: 0 });
                    setLastRefresh(new Date());
                }
            } catch (error) {
                console.error('Failed to fetch admin bookings:', error);
            } finally {
                setAdminLoading(false);
            }
        };

        fetchAllBookings(); // Initial fetch
        const interval = setInterval(fetchAllBookings, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [isAdmin]);

    // ADMIN: Fetch ALL parties (LIVE REAL-TIME LISTENER)
    useEffect(() => {
        if (!isAdmin) return;

        setAdminPartiesLoading(true);
        const q = query(collection(db, 'parties'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const parties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAdminParties(parties);
            setAdminPartiesLoading(false);
        }, (err) => {
            console.error('Failed to listen to admin parties:', err);
            setAdminPartiesLoading(false);
        });

        return () => unsubscribe();
    }, [isAdmin]);

    // Fetch Hosted Parties (LIVE REAL-TIME LISTENER)
    useEffect(() => {
        if (!currentUser?.uid) {
            setHostedParties([]);
            return;
        }

        setLoadingParties(true);
        const q = query(collection(db, 'parties'), where('hostUserId', '==', currentUser.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const parties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Sort by date locally
            parties.sort((a: any, b: any) => {
                const dateA = new Date(a.bookingDate).getTime();
                const dateB = new Date(b.bookingDate).getTime();
                return dateA - dateB;
            });

            setHostedParties(parties);
            setLoadingParties(false);
        }, (err) => {
            console.error('Failed to listen to hosted parties:', err);
            setLoadingParties(false);
        });

        return () => unsubscribe();
    }, [currentUser?.uid]);

    // Fetch Attending Parties (LIVE REAL-TIME LISTENER)
    useEffect(() => {
        if (!currentUser?.uid) {
            setAttendingParties([]);
            return;
        }

        setLoadingAttendingParties(true);

        const userRef = doc(db, 'users', currentUser.uid);
        let unsubscribeParties: (() => void) | null = null;

        const unsubscribeUser = onSnapshot(userRef, (userSnap) => {
            if (!userSnap.exists()) {
                setAttendingParties([]);
                setLoadingAttendingParties(false);
                return;
            }

            const data = userSnap.data();
            const attendingIds = data.partyInfo?.attendingParties || [];

            // Cleanup previous parties listener if it exists
            if (unsubscribeParties) {
                unsubscribeParties();
                unsubscribeParties = null;
            }

            if (attendingIds.length === 0) {
                setAttendingParties([]);
                setLoadingAttendingParties(false);
                return;
            }

            // Setup a real-time listener for the actual parties
            const partiesRef = collection(db, 'parties');
            const q = query(partiesRef, where(documentId(), 'in', attendingIds));

            unsubscribeParties = onSnapshot(q, (partySnap) => {
                const parties = partySnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // Sort by date locally
                parties.sort((a: any, b: any) => {
                    const dateA = new Date(a.bookingDate).getTime();
                    const dateB = new Date(b.bookingDate).getTime();
                    return dateA - dateB;
                });

                setAttendingParties(parties);
                setLoadingAttendingParties(false);
            }, (err) => {
                console.error('Failed to listen to attending parties:', err);
                setLoadingAttendingParties(false);
            });

        }, (err) => {
            console.error('Failed to listen to user attending info:', err);
            setLoadingAttendingParties(false);
        });

        return () => {
            unsubscribeUser();
            if (unsubscribeParties) unsubscribeParties();
        };
    }, [currentUser?.uid]);

    const isPastParty = (party: any) => {
        if (!party.bookingDate || !party.bookingTime) return false;
        try {
            // Parse date "YYYY-MM-DD" and time "HH:MM" locally to avoid UTC shifts
            const [y, m, d] = party.bookingDate.split('-').map(Number);
            const [hrs, mins] = (party.bookingTime || "00:00").split(':').map(Number);
            const duration = parseInt(party.duration) || 1;

            // Create local date object
            const bookingEnd = new Date(y, m - 1, d, hrs + duration, mins);
            return new Date() > bookingEnd;
        } catch (e) {
            return false;
        }
    };

    const handleCopyInvite = (pid: string) => {
        const link = `${window.location.origin}/signup?party=${pid}`;
        navigator.clipboard.writeText(link);
        setCopiedId(pid);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleAdminCancelParty = async (partyId: string, party: any) => {
        if (!window.confirm('Are you sure you want to mark this party as CANCELED in the app? This will only update the app dashboard (Firestore), it will NOT trigger another cancellation in Google Sheets. Use this to fix desynced/legacy data.')) return;

        try {
            await updateDoc(doc(db, 'parties', partyId), {
                status: 'cancelled',
                updatedAt: new Date().toISOString()
            });

            // ✅ LEDGER SYNC: Update main transactions_log so CRM reflects the manual cancellation
            try {
                const txRef = collection(db, 'transactions_log');
                // Try bookingId first
                if (party.bookingId) {
                    const q = query(txRef, where('bookingId', '==', party.bookingId));
                    const txSnapshot = await getDocs(q);
                    if (!txSnapshot.empty) {
                        const txPromises = txSnapshot.docs.map(txDoc =>
                            updateDoc(doc(db, 'transactions_log', txDoc.id), {
                                status: 'cancelled',
                                cancelledAt: serverTimestamp()
                            })
                        );
                        await Promise.all(txPromises);
                    }
                } else if (party.hostEmail) {
                    // Fallback to email + date
                    const q2 = query(txRef,
                        where('email', '==', party.hostEmail),
                        where('date', '==', party.bookingDate)
                    );
                    const txSnapshot2 = await getDocs(q2);
                    if (!txSnapshot2.empty) {
                        const txPromises2 = txSnapshot2.docs.map(txDoc =>
                            updateDoc(doc(db, 'transactions_log', txDoc.id), {
                                status: 'cancelled',
                                cancelledAt: serverTimestamp()
                            })
                        );
                        await Promise.all(txPromises2);
                    }
                }
            } catch (ledgerErr) {
                console.error('[CRM] Manual ledger sync failed:', ledgerErr);
            }

            window.alert('Party marked as cancelled in Firestore.');
        } catch (err) {
            console.error('Failed to update party status:', err);
            window.alert('Failed to update status.');
        }
    };

    const handleExportGuests = (party: any) => {
        if (!party.registeredGuests || party.registeredGuests.length === 0) {
            setError('No guests registered yet.');
            return;
        }

        const headers = ['Name', 'Email', 'Registered At'];
        const csvRows = [headers.join(',')];

        party.registeredGuests.forEach((guest: any) => {
            const row = [
                `"${guest.name}"`,
                `"${guest.email}"`,
                `"${guest.registeredAt}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `guests_${party.bookingDate}_${party.hostName.replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showEditModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showEditModal]);

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
            // Sanitize juniorDrivers to remove undefined values which Firestore rejects
            const sanitizedJuniors = juniorDrivers.map(driver => {
                const cleanDriver: any = { name: driver.name };
                if (driver.photoURL) cleanDriver.photoURL = driver.photoURL;
                return cleanDriver;
            });

            await updateProfile({ ...editFormData, juniorDrivers: sanitizedJuniors });
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            setSaveError('Failed to update profile: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddJuniorDriver = () => {
        if (newJuniorName.trim()) {
            setJuniorDrivers([...juniorDrivers, {
                name: newJuniorName.trim()
            }]);
            setNewJuniorName('');
        }
    };

    const handleRemoveJuniorDriver = (index: number) => {
        setJuniorDrivers(juniorDrivers.filter((_, i) => i !== index));
    };

    // Photo Upload/Delete Handlers
    const handleParentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        const error = validatePhotoFile(file);
        if (error) {
            setSaveError(error);
            return;
        }

        setUploadingPhoto(true);
        setSaveError('');
        try {
            await uploadProfilePhoto(currentUser.uid, file);

            // ✅ SUCCESS: Show alert immediately
            window.alert('Profile photo updated successfully!');

            try {
                await refreshUserProfile(); // Force UI update
            } catch (refreshErr) {
                console.warn('Photo uploaded but UI refresh failed:', refreshErr);
                // Swallow this error so user knows upload worked
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setSaveError('Failed to upload photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
            if (parentPhotoInputRef.current) parentPhotoInputRef.current.value = '';
        }
    };

    const handleParentPhotoDelete = async () => {
        if (!currentUser) return;
        setUploadingPhoto(true);
        try {
            await deleteProfilePhoto(currentUser.uid);

            // ✅ SUCCESS: Show alert immediately
            window.alert('Profile photo removed.');

            // ⚡ OPTIMISTIC UPDATE: Clear local preview immediately
            setPhotoPreview(null);

            await refreshUserProfile(); // Force UI update
        } catch (err) {
            setSaveError('Failed to delete photo.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleJuniorPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        const error = validatePhotoFile(file);
        if (error) {
            setSaveError(error);
            return;
        }

        setUploadingJuniorIndex(index);
        setSaveError('');
        try {
            const downloadURL = await uploadProfilePhoto(currentUser.uid, file, index);

            // Update local state immediately so user sees it
            const updatedJuniors = [...juniorDrivers];
            updatedJuniors[index] = { ...updatedJuniors[index], photoURL: downloadURL };
            setJuniorDrivers(updatedJuniors);

            await refreshUserProfile(); // Sync global state
        } catch (err) {
            setSaveError('Failed to upload photo.');
        } finally {
            setUploadingJuniorIndex(null);
        }
    };

    const handleJuniorPhotoDelete = async (index: number) => {
        if (!currentUser) return;
        setUploadingJuniorIndex(index);
        try {
            await deleteProfilePhoto(currentUser.uid, index);

            // Update local state immediately so user sees it
            const updatedJuniors = [...juniorDrivers];
            updatedJuniors[index] = { ...updatedJuniors[index], photoURL: undefined };
            setJuniorDrivers(updatedJuniors);

            await refreshUserProfile(); // Sync global state
        } catch (err) {
            setSaveError('Failed to delete photo.');
        } finally {
            setUploadingJuniorIndex(null);
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
        if (!timeStr) return 'Time TBD';
        const parts = timeStr.split(':');
        const hours = parts[0] || '12';
        const minutes = parts[1] || '00';
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
                {/* Status Messages */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-[#2D9E49]/10 border border-[#2D9E49]/30 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3 text-[#2D9E49]">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                        <button onClick={() => setSuccessMessage(null)} className="text-[#2D9E49]/60 hover:text-[#2D9E49]">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 bg-[#D42428]/10 border border-[#D42428]/30 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3 text-[#D42428]">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-[#D42428]/60 hover:text-[#D42428]">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

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

                {/* ADMIN SECTION */}
                {isAdmin && (
                    <div className="mb-8">
                        {/* Admin View Toggle: Bookings vs Customers */}
                        <div className="flex items-center gap-3 mb-4">
                            <button
                                onClick={() => setAdminView('bookings')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${adminView === 'bookings'
                                    ? 'bg-[#D42428] text-white'
                                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                Bookings
                            </button>
                            <button
                                onClick={() => {
                                    setAdminView('customers');
                                    // Fetch CRM data on first click
                                    if (crmCustomers.length === 0 && !crmLoading) {
                                        loadCRMData();
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${adminView === 'customers'
                                    ? 'bg-[#D42428] text-white'
                                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                Customers CRM
                            </button>
                            <button
                                onClick={() => setAdminView('parties')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${adminView === 'parties'
                                    ? 'bg-[#D42428] text-white'
                                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                <Rocket className="w-4 h-4" />
                                Parties {adminParties.filter(p => !isPastParty(p) && p.status !== 'cancelled').length > 0 && `(${adminParties.filter(p => !isPastParty(p) && p.status !== 'cancelled').length})`}
                            </button>
                        </div>

                        {/* Bookings View */}
                        {adminView === 'bookings' && (
                            <div className="bg-[#141414] rounded-2xl border border-[#D42428]/30 overflow-hidden">
                                {/* Admin Header */}
                                <div className="bg-[#D42428]/10 px-6 py-4 border-b border-[#D42428]/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-[#D42428]" />
                                            <h2 className="font-display text-lg font-bold text-white uppercase">Admin Booking Dashboard</h2>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            {adminLoading && (
                                                <span className="text-white/40 flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-[#D42428] border-t-transparent rounded-full animate-spin"></div>
                                                    Refreshing...
                                                </span>
                                            )}
                                            {lastRefresh && !adminLoading && (
                                                <span className="text-white/40">
                                                    🔄 Auto-refresh: {lastRefresh.toLocaleTimeString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Tabs */}
                                <div className="flex border-b border-white/10">
                                    <button
                                        onClick={() => setAdminTab('today')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${adminTab === 'today'
                                            ? 'text-[#D42428] border-b-2 border-[#D42428] bg-[#D42428]/5'
                                            : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        Today ({adminStats.todayCount})
                                    </button>
                                    <button
                                        onClick={() => setAdminTab('upcoming')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${adminTab === 'upcoming'
                                            ? 'text-[#2D9E49] border-b-2 border-[#2D9E49] bg-[#2D9E49]/5'
                                            : 'text-white/60 hover:text-white'
                                            }`}
                                    >
                                        Upcoming ({adminStats.upcomingCount})
                                    </button>
                                    <button
                                        onClick={() => setAdminTab('past')}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${adminTab === 'past'
                                            ? 'text-white/60 border-b-2 border-white/30'
                                            : 'text-white/40 hover:text-white/60'
                                            }`}
                                    >
                                        Past ({adminStats.pastCount})
                                    </button>
                                </div>

                                {/* Admin Booking Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-black/30">
                                            <tr className="text-left text-white/40 text-xs uppercase">
                                                <th className="px-4 py-3">Time</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Station</th>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Phone</th>
                                                <th className="px-4 py-3">Payment</th>
                                                <th className="px-4 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(adminTab === 'today' ? adminTodayBookings :
                                                adminTab === 'upcoming' ? adminUpcomingBookings :
                                                    adminPastBookings
                                            ).map((booking) => (
                                                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-[#D42428] font-medium">{booking.time}</td>
                                                    <td className="px-4 py-3 text-white">{booking.date}</td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className="px-2 py-1 rounded text-xs font-medium"
                                                            style={{
                                                                backgroundColor: `${getStationColor(booking.station)}20`,
                                                                color: getStationColor(booking.station)
                                                            }}
                                                        >
                                                            {booking.station}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-white">{booking.name}</td>
                                                    <td className="px-4 py-3 text-white/60">{booking.email}</td>
                                                    <td className="px-4 py-3 text-white/60">{booking.phone || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        {booking.paymentMethod && (() => {
                                                            const paymentStatus = getPaymentStatus(booking.station, booking.paymentMethod);
                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="text-white/60 capitalize text-xs">{booking.paymentMethod}</div>
                                                                    <div className="text-[10px] font-mono text-white/80">
                                                                        Paid: {formatCurrency(paymentStatus.paid)} | Remaining: {formatCurrency(paymentStatus.remaining)}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${booking.status === 'Confirmed'
                                                            ? 'bg-[#2D9E49]/20 text-[#2D9E49]'
                                                            : booking.status === 'Cancelled'
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-yellow-500/20 text-yellow-400'
                                                            }`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(adminTab === 'today' ? adminTodayBookings :
                                                adminTab === 'upcoming' ? adminUpcomingBookings :
                                                    adminPastBookings
                                            ).length === 0 && (
                                                    <tr>
                                                        <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                                                            No {adminTab} bookings found
                                                        </td>
                                                    </tr>
                                                )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Customers CRM View */}
                        {adminView === 'customers' && (
                            <div className="bg-[#141414] rounded-2xl border border-[#D42428]/30 overflow-hidden">
                                <div className="bg-[#D42428]/10 px-6 py-4 border-b border-[#D42428]/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-[#D42428]" />
                                            <h2 className="font-display text-lg font-bold text-white uppercase">Customer Analytics</h2>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {/* Sync Status Indicator */}
                                            {syncStatus !== 'idle' && (
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${syncStatus === 'done'
                                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                                    : syncStatus === 'syncing'
                                                        ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'syncing' ? 'animate-pulse bg-yellow-400' : syncStatus === 'done' ? 'bg-green-400' : 'bg-red-500'}`} />
                                                    {syncStatus === 'syncing' ? `Syncing ${syncCount}...` : syncStatus === 'done' ? `Synced ${syncCount} Records` : 'Sync Failed'}
                                                </div>
                                            )}

                                            <button
                                                onClick={syncBookingsToFirebase}
                                                disabled={syncStatus === 'syncing'}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all border bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50`}
                                                title="Re-sync data from Google Sheets"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                                                Sync Sheet
                                            </button>

                                            <button
                                                onClick={handleExportCRM}
                                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all bg-[#2D9E49] hover:bg-[#2D9E49]/80 text-white shadow-lg shadow-[#2D9E49]/20"
                                            >
                                                <Download className="w-4 h-4" />
                                                Harvest (CSV)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <CustomersTable customers={crmCustomers} loading={crmLoading} onRefresh={loadCRMData} />
                                </div>
                            </div>
                        )}

                        {/* Parties Admin View */}
                        {adminView === 'parties' && (
                            <div className="bg-[#141414] rounded-2xl border border-[#D42428]/30 overflow-hidden">
                                <div className="bg-[#D42428]/10 px-6 py-4 border-b border-[#D42428]/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-3">
                                                <Rocket className="w-5 h-5 text-[#D42428]" />
                                                <h2 className="font-display text-lg font-bold text-white uppercase">Party Bookings</h2>
                                            </div>

                                            {/* Sub-tabs for Parties */}
                                            <div className="flex items-center bg-black/40 p-1 rounded-lg border border-white/5">
                                                <button
                                                    onClick={() => setAdminPartyTab('active')}
                                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${adminPartyTab === 'active'
                                                        ? 'bg-[#D42428] text-white shadow-lg'
                                                        : 'text-white/40 hover:text-white'}`}
                                                >
                                                    Active
                                                </button>
                                                <button
                                                    onClick={() => setAdminPartyTab('archive')}
                                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${adminPartyTab === 'archive'
                                                        ? 'bg-[#D42428] text-white shadow-lg'
                                                        : 'text-white/40 hover:text-white'}`}
                                                >
                                                    Archive
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setLastRefresh(new Date())}
                                            className="text-white/40 hover:text-white transition-colors"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${adminPartiesLoading ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-black/30">
                                            <tr className="text-left text-white/40 text-xs uppercase">
                                                <th className="px-4 py-3">Date/Time</th>
                                                <th className="px-4 py-3">Host</th>
                                                <th className="px-4 py-3">Guests</th>
                                                <th className="px-4 py-3">Revenue</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {adminParties
                                                .filter(party => {
                                                    const isPast = isPastParty(party);
                                                    const isCancelled = party.status === 'cancelled';
                                                    if (adminPartyTab === 'active') {
                                                        return !isPast && !isCancelled;
                                                    } else {
                                                        return isPast || isCancelled;
                                                    }
                                                })
                                                .map((party) => (
                                                    <React.Fragment key={party.id}>
                                                        <tr className="hover:bg-amber-500/5 transition-colors text-white border-l-4 border-amber-500/50">
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium text-amber-500">{party.bookingDate}</div>
                                                                <div className="text-[10px] text-white/40">{party.bookingTime} ({party.duration}h)</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">{party.hostName}</div>
                                                                <div className="text-[10px] text-white/40">{party.hostEmail}</div>
                                                            </td>
                                                            <td
                                                                className="px-4 py-3 cursor-pointer group"
                                                                onClick={() => setExpandedPartyId(expandedPartyId === party.id ? null : party.id)}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex flex-col">
                                                                        <div className="flex items-center gap-1 text-amber-500 group-hover:text-amber-400">
                                                                            <Users className="w-3 h-3" />
                                                                            <span className="font-bold">{party.registeredGuests?.length || 0} / {party.maxGuests}</span>
                                                                            {expandedPartyId === party.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                                        </div>
                                                                        <div className="w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                                                            <div
                                                                                className="h-full bg-amber-500"
                                                                                style={{ width: `${Math.min(100, ((party.registeredGuests?.length || 0) / (party.maxGuests || 15)) * 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        {party.registeredGuests?.length > 0 && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleExportGuests(party);
                                                                                }}
                                                                                className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                                                                                title="Export Guest List"
                                                                            >
                                                                                <Download className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCopyInvite(party.id);
                                                                            }}
                                                                            className={`p-1 rounded transition-colors ${copiedId === party.id ? 'bg-[#2D9E49] text-white' : 'hover:bg-white/10 text-white/40 hover:text-white'}`}
                                                                            title="Copy Invite Link"
                                                                        >
                                                                            {copiedId === party.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-amber-500 font-bold">${party.totalPrice}</div>
                                                                <div className="text-[10px] text-white/40">Amount Paid: ${party.depositPaid}</div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest text-center ${party.status === 'confirmed' ? 'bg-[#2D9E49]/20 text-[#2D9E49]' : 'bg-white/10 text-white/40'}`}>
                                                                        {party.status}
                                                                    </span>
                                                                    {party.status === 'confirmed' && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleAdminCancelParty(party.id, party);
                                                                            }}
                                                                            className="flex items-center justify-center gap-1 mt-1 text-[8px] font-bold uppercase tracking-tighter text-[#D42428] hover:text-white hover:bg-[#D42428] transition-all py-0.5 rounded border border-[#D42428]/30"
                                                                            title="Manual Override: Mark as Canceled in App"
                                                                        >
                                                                            <Trash2 className="w-2.5 h-2.5" />
                                                                            Repair Sync
                                                                        </button>
                                                                    )}
                                                                    <span className="bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase tracking-tighter px-1 py-0.5 rounded border border-amber-500/20 text-center">
                                                                        Party Booking
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-white/40 text-[10px]">
                                                                {party.createdAt?.toDate ? party.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                                            </td>
                                                        </tr>
                                                        {expandedPartyId === party.id && (
                                                            <tr className="bg-amber-500/5">
                                                                <td colSpan={6} className="px-4 py-4 border-l-4 border-amber-500/20">
                                                                    <div className="flex items-center gap-2 mb-3 text-white/40 text-[10px] uppercase tracking-widest font-bold">
                                                                        <Users className="w-3 h-3 text-amber-500" />
                                                                        Joined Guest Log ({party.registeredGuests?.length || 0})
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                        {party.registeredGuests && party.registeredGuests.length > 0 ? (
                                                                            party.registeredGuests.map((guest: any, idx: number) => (
                                                                                <div key={idx} className="flex items-center gap-3 p-2 bg-black/40 rounded-lg border border-white/5">
                                                                                    <div className="w-7 h-7 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 text-[10px] font-bold uppercase">
                                                                                        {guest.name ? guest.name.charAt(0) : '?'}
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <div className="text-white text-xs font-bold truncate">{guest.name}</div>
                                                                                        <div className="text-white/40 text-[9px] truncate">{guest.email}</div>
                                                                                    </div>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="col-span-full py-4 text-center text-white/20 text-xs italic">
                                                                                No guests have registered yet.
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            {adminParties.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                                                        No party bookings found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-[#141414] rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-[#2D9E49]/20 rounded-full overflow-hidden border-2 border-[#2D9E49]/30">
                                {userProfile?.photoURL ? (
                                    <img
                                        src={userProfile.photoURL}
                                        alt={userProfile.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-[#2D9E49]" />
                                    </div>
                                )}
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
                                        <label className="block text-white/60 text-sm mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={editFormData.phone}
                                            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#2D9E49]"
                                            placeholder="555-0123"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-white/60 text-sm mb-1">Favorite Discipline</label>
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

                    {/* Junior Drivers Card */}
                    {userProfile?.juniorDrivers && userProfile.juniorDrivers.length > 0 && (
                        <div className="bg-[#141414] rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-[#2D9E49]/20 rounded-lg flex items-center justify-center">
                                        <User className="w-6 h-6 text-[#2D9E49]" />
                                    </div>
                                    <div>
                                        <h2 className="font-display text-lg font-bold text-white uppercase">Junior Drivers</h2>
                                        <p className="text-white/60 text-sm">Covered by your waiver</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="text-[#2D9E49] hover:text-[#248a3f] transition-colors flex items-center gap-1 text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                {userProfile.juniorDrivers.map((junior, index) => (
                                    <div key={index} className="flex items-center gap-2 p-3 bg-black/30 rounded-lg">
                                        <div className="w-8 h-8 bg-[#2D9E49]/20 rounded-full flex items-center justify-center overflow-hidden">
                                            {junior.photoURL ? (
                                                <img src={junior.photoURL} alt={junior.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-4 h-4 text-[#2D9E49]" />
                                            )}
                                        </div>
                                        <span className="text-white font-medium">{junior.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Your Hosted Parties */}
                {hostedParties.length > 0 && (
                    <div className="mt-8">
                        <h2 className="font-display text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#D42428]" />
                            Your Hosted Parties
                        </h2>
                        <div className="grid gap-6">
                            {hostedParties
                                .filter(party => {
                                    const isPast = isPastParty(party);
                                    const isCancelled = party.status === 'cancelled';
                                    return !isPast && !isCancelled;
                                })
                                .map((party) => (
                                    <div key={party.id} className="bg-[#141414] rounded-2xl p-6 border border-[#D42428]/30 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${party.status === 'confirmed' ? 'bg-[#2D9E49]/20 text-[#2D9E49]' : 'bg-white/10 text-white/40'}`}>
                                                {party.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-col lg:flex-row gap-8">
                                            {/* Party Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-[#D42428]/20 rounded-xl flex items-center justify-center">
                                                        <Calendar className="w-6 h-6 text-[#D42428]" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-white font-display font-bold uppercase text-lg">Facility Takeover</h3>
                                                        <p className="text-white/60 text-sm">
                                                            {formatDate(party.bookingDate)} at {formatTime(party.bookingTime)} • {party.duration} Hours
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                                    <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex flex-col justify-between">
                                                        <div>
                                                            <span className="block text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1">Registration Status</span>
                                                            <div className="flex items-end gap-2 mb-2">
                                                                <span className="text-2xl font-bold text-white leading-none">{party.registeredGuests?.length || 0}</span>
                                                                <span className="text-white/40 text-xs mb-0.5">/ {party.maxGuests} Guests</span>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-[#2D9E49] shadow-[0_0_10px_rgba(45,158,73,0.3)] transition-all duration-500"
                                                                    style={{ width: `${Math.min(100, ((party.registeredGuests?.length || 0) / (party.maxGuests || 15)) * 100)}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                                <span className="text-[#2D9E49]">{(party.maxGuests || 15) - (party.registeredGuests?.length || 0)} SEATS LEFT</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                                        <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Amount Paid</span>
                                                        <div className="text-xl font-bold text-green-500">${party.depositPaid}</div>
                                                        <div className="text-[10px] text-white/40 mt-1 uppercase">Stripe / PayPal</div>
                                                    </div>
                                                    <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                                        <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Remaining</span>
                                                        <div className="text-xl font-bold text-white opacity-60">${party.remainingBalance}</div>
                                                        <div className="text-[10px] text-white/40 mt-1 uppercase italic">Pay at Venue</div>
                                                    </div>
                                                    <div className="p-4 bg-[#D42428]/5 rounded-xl border border-[#D42428]/10">
                                                        <span className="block text-[#D42428] text-[10px] uppercase tracking-widest mb-1 font-bold">Total Bill</span>
                                                        <div className="text-xl font-bold text-white">${party.totalPrice}</div>
                                                        <div className="text-[10px] text-white/40 mt-1 uppercase">{party.duration}hr Full Facility</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Invitation & Management */}
                                            <div className="lg:w-80 space-y-4">
                                                <div className="p-4 bg-[#2D9E49]/10 rounded-xl border border-[#2D9E49]/20">
                                                    <h4 className="text-[#2D9E49] font-display text-xs font-bold uppercase mb-2">Invite Your Crew</h4>
                                                    <p className="text-white/60 text-[11px] mb-3">Send this link to your guests so they can register and sign the waiver.</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => handleCopyInvite(party.id)}
                                                            className={`py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${copiedId === party.id
                                                                ? 'bg-[#2D9E49] text-white'
                                                                : 'bg-white/10 text-white hover:bg-white/20'}`}
                                                        >
                                                            {copiedId === party.id ? (
                                                                <><CheckCircle className="w-4 h-4" /> Copied!</>
                                                            ) : (
                                                                <>Copy Link</>
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => handleExportGuests(party)}
                                                            disabled={!party.registeredGuests || party.registeredGuests.length === 0}
                                                            className="py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-30"
                                                        >
                                                            <Download className="w-4 h-4" /> Export
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 italic text-[11px] text-white/40">
                                                    Tip: Only registered guests can participate. Each guest creates their own driver profile.
                                                </div>

                                                {party.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => handleCancelBooking(party.bookingId)}
                                                        className="w-full py-3 border border-[#D42428]/30 text-[#D42428] rounded-xl hover:bg-[#D42428]/10 transition-all font-display text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Cancel Party Booking
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Guest List Section */}
                                        <div className="mt-8 pt-8 border-t border-white/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-white font-display font-bold uppercase text-sm flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-[#2D9E49]" />
                                                    Guest Registry
                                                </h4>
                                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                                    {party.registeredGuests?.length || 0} / {party.maxGuests} Active
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {/* Registered Guests */}
                                                {party.registeredGuests?.map((guest: any, idx: number) => (
                                                    <div key={`registered-${idx}`} className="flex items-center justify-between p-3 bg-[#2D9E49]/5 rounded-xl border border-[#2D9E49]/20 group hover:bg-[#2D9E49]/10 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[#2D9E49]/10 rounded-full flex items-center justify-center text-[#2D9E49] font-bold text-xs ring-1 ring-[#2D9E49]/30">
                                                                {typeof guest === 'string' ? '?' : guest.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-white text-sm font-bold truncate">
                                                                    {typeof guest === 'string' ? `Member ID: ${guest.substring(0, 8)}` : guest.name}
                                                                </p>
                                                                <p className="text-white/40 text-[10px] truncate">
                                                                    {typeof guest === 'string' ? 'Legacy Account' : guest.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {guest.registeredAt && (
                                                            <span className="text-[9px] text-[#2D9E49]/40 font-bold uppercase shrink-0">
                                                                {new Date(guest.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Available Slots (Empty Seats) */}
                                                {Array.from({ length: Math.max(0, (party.maxGuests || 15) - (party.registeredGuests?.length || 0)) }).map((_, idx) => (
                                                    <div key={`empty-${idx}`} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-dashed border-white/10 opacity-40">
                                                        <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                                                            <Users className="w-3 h-3 text-white/20" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white/40 text-sm font-medium italic">Empty Seat</p>
                                                            <p className="text-white/20 text-[10px] uppercase">Awaiting invite</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )
                }

                {/* Attending Parties (Guest View) */}
                {
                    attendingParties.length > 0 && (
                        <div className="mt-8">
                            <h2 className="font-display text-xl font-bold text-white uppercase mb-4 flex items-center gap-2">
                                <Rocket className="w-5 h-5 text-[#2D9E49]" />
                                Parties You're Attending
                            </h2>
                            <div className="grid gap-4">
                                {attendingParties
                                    .filter(party => {
                                        const isPast = isPastParty(party);
                                        const isCancelled = party.status === 'cancelled';
                                        return !isPast && !isCancelled;
                                    })
                                    .map((party) => (
                                        <div key={party.id} className="bg-[#141414] rounded-2xl p-6 border border-[#2D9E49]/30 relative overflow-hidden group hover:border-[#2D9E49]/50 transition-colors">
                                            <div className="absolute top-0 right-0 p-4">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#2D9E49]/20 text-[#2D9E49] flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> Registered
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-[#2D9E49]/10 rounded-xl flex items-center justify-center shrink-0">
                                                    <Calendar className="w-8 h-8 text-[#2D9E49]" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-display font-bold uppercase text-lg">Facility Takeover</h3>
                                                    <p className="text-white font-medium text-sm">Hosted by <span className="text-[#2D9E49]">{party.hostName}</span></p>
                                                    <p className="text-white/60 text-xs mt-1">
                                                        {formatDate(party.bookingDate)} at {formatTime(party.bookingTime)} • {party.duration} Hours
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-6 flex gap-3">
                                                <a
                                                    href={`https://maps.google.com/?q=Kartcade`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-white/10"
                                                >
                                                    <Monitor className="w-4 h-4" />
                                                    Get Directions
                                                </a>
                                                <Link
                                                    to="/waiver"
                                                    className="flex-1 py-3 bg-[#2D9E49]/10 hover:bg-[#2D9E49]/20 text-[#2D9E49] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-[#2D9E49]/20"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Update Waiver
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )
                }

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
                                                {/* Payment Status */}
                                                {booking.paymentMethod && (() => {
                                                    const paymentStatus = getPaymentStatus(booking.station, booking.paymentMethod);
                                                    return (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <DollarSign className="w-3 h-3 text-white/40" />
                                                            <span className="text-[11px] font-mono text-white/60">
                                                                PAID: {formatCurrency(paymentStatus.paid)} | REMAINING: {formatCurrency(paymentStatus.remaining)}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
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
                {
                    historyList.length > 0 && (
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
                    )
                }
            </div >
            {/* Edit Profile Modal */}
            {
                showEditModal && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden"
                        onClick={(e) => {
                            // Close modal when clicking backdrop
                            if (e.target === e.currentTarget) setShowEditModal(false);
                        }}
                    >
                        <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg relative max-h-[70vh] sm:max-h-[75vh] flex flex-col my-4">
                            {/* Fixed Header with Close Button */}
                            <div className="flex items-center justify-between p-4 sm:p-6 pb-2 sm:pb-3 flex-shrink-0">
                                <h2 className="font-display text-lg sm:text-xl font-bold uppercase text-white">Edit Driver Profile</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="ml-2 text-white/40 hover:text-white transition-colors flex-shrink-0"
                                    type="button"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div
                                className="overflow-y-auto overflow-x-hidden px-4 sm:px-6 pb-4 sm:pb-6"
                                onWheel={(e) => {
                                    // Prevent event from bubbling to prevent background scroll
                                    e.stopPropagation();
                                }}
                            >

                                {saveError && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                                        {saveError}
                                    </div>
                                )}

                                <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4">
                                    {/* Parent Photo Upload Section */}
                                    <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-3">Profile Photo</label>
                                        <div className="flex items-center gap-4">
                                            {/* Photo Preview */}
                                            <div className="w-20 h-20 bg-[#2D9E49]/20 rounded-full overflow-hidden border-2 border-[#2D9E49]/30 flex-shrink-0">
                                                {photoPreview ? (
                                                    <img
                                                        src={photoPreview}
                                                        alt={userProfile?.name || 'User'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <User className="w-10 h-10 text-[#2D9E49]" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Upload/Delete Buttons */}
                                            <div className="flex gap-2 flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleParentPhotoUpload}
                                                    className="hidden"
                                                    id="parent-photo-upload"
                                                    ref={parentPhotoInputRef}
                                                />
                                                <label
                                                    htmlFor="parent-photo-upload"
                                                    className="flex-1 px-4 py-2 bg-[#2D9E49] text-white rounded-lg font-bold text-sm hover:bg-[#248a3f] transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                                                >
                                                    {uploadingPhoto ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span>Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Camera className="w-4 h-4" />
                                                            <span>Upload</span>
                                                        </>
                                                    )}
                                                </label>

                                                {(photoPreview || userProfile?.photoURL) && (
                                                    <button
                                                        type="button"
                                                        onClick={handleParentPhotoDelete}
                                                        disabled={uploadingPhoto}
                                                        className="px-4 py-2 bg-[#D42428] text-white rounded-lg font-bold text-sm hover:bg-[#B91C1C] transition-colors disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Fav Discipline</label>
                                            <input
                                                type="text"
                                                value={editFormData.favDiscipline}
                                                onChange={(e) => setEditFormData({ ...editFormData, favDiscipline: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white text-sm focus:border-[#2D9E49] outline-none"
                                                placeholder="e.g. GT3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Fav Track</label>
                                            <input
                                                type="text"
                                                value={editFormData.favTrack}
                                                onChange={(e) => setEditFormData({ ...editFormData, favTrack: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white text-sm focus:border-[#2D9E49] outline-none"
                                                placeholder="e.g. Spa"
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Mobile Number</label>
                                            <input
                                                type="tel"
                                                value={editFormData.phone}
                                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#2D9E49] outline-none"
                                                placeholder="555-123-4567"
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

                                    {/* Junior Drivers Section */}
                                    <div className="border-t border-white/10 pt-4">
                                        <label className="block text-xs uppercase tracking-widest text-white/40 mb-3">Junior Drivers (Optional)</label>
                                        <p className="text-xs text-white/50 mb-3">Add minors to your account. They will be covered by your acceptance of the waiver.</p>

                                        {/* List of Junior Drivers */}
                                        {juniorDrivers.length > 0 && (
                                            <div className="space-y-2 mb-3">
                                                {juniorDrivers.map((junior, index) => (
                                                    <div key={index} className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3 py-2">
                                                        {/* Photo */}
                                                        <div className="w-10 h-10 bg-[#2D9E49]/20 rounded-full overflow-hidden flex-shrink-0">
                                                            {junior.photoURL ? (
                                                                <img src={junior.photoURL} alt={junior.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-[#2D9E49]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Name */}
                                                        <span className="text-white text-sm flex-1">{junior.name}</span>
                                                        {/* Upload/Delete Photo */}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleJuniorPhotoUpload(index, e)}
                                                            className="hidden"
                                                            id={`junior-photo-${index}`}
                                                        />
                                                        <label
                                                            htmlFor={`junior-photo-${index}`}
                                                            className="cursor-pointer text-[#2D9E49] hover:text-[#248a3f] transition-colors"
                                                        >
                                                            {uploadingJuniorIndex === index ? (
                                                                <div className="w-4 h-4 border-2 border-[#2D9E49] border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <Camera className="w-4 h-4" />
                                                            )}
                                                        </label>
                                                        {junior.photoURL && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleJuniorPhotoDelete(index)}
                                                                className="text-[#D42428] hover:text-[#B91C1C] transition-colors"
                                                                disabled={uploadingJuniorIndex === index}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {/* Remove Junior */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveJuniorDriver(index)}
                                                            className="text-[#D42428] hover:text-[#B91C1C] transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Add Junior Driver Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newJuniorName}
                                                onChange={(e) => setNewJuniorName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddJuniorDriver())}
                                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-[#2D9E49] outline-none"
                                                placeholder="Enter child's name"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddJuniorDriver}
                                                className="px-4 py-2 bg-[#2D9E49] text-white rounded-lg font-bold text-sm hover:bg-[#248a3f] transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 pb-2 sm:pb-0">
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
                    </div>
                )
            }
        </div >
    );
};

export default DashboardPage;
