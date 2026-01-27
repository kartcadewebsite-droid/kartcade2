// ============================================================
// BOOKING SYSTEM CONFIGURATION
// ============================================================
// Update the API_URL with your Google Apps Script Web App URL
// after deploying the script
// ============================================================

export const bookingConfig = {
    // ✅ LIVE - Connected to kartcade.website@gmail.com Google Sheets
    API_URL: 'https://script.google.com/macros/s/AKfycbzlJM7zscm9Txy-5Q2MLqoqDtzbab6a0L-CtUWIRUWrN0Bo8b-GGK51iuDa6hQOBpV5UA/exec',

    // PayPal Configuration
    paypalClientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,

    // Station types and their properties
    stations: {
        karts: {
            id: 'karts',
            name: 'Racing Karts',
            price: 30,
            units: 5,
            description: 'Perfect for kids 5+, teens, and adults under 6\'3"',
            ageReq: '5+',
            color: '#2D9E49',
            maxPerBooking: 5
        },
        rigs: {
            id: 'rigs',
            name: 'Full-Size Rigs',
            price: 40,
            units: 3,
            description: 'Professional direct-drive simulators for adults',
            ageReq: '10+',
            color: '#FFFFFF',
            maxPerBooking: 3
        },
        motion: {
            id: 'motion',
            name: 'Motion Simulator',
            price: 50,
            units: 1,
            description: 'Triple-screen with motion platform - the ultimate experience',
            ageReq: '14+',
            color: '#D42428',
            maxPerBooking: 1
        },
        flight: {
            id: 'flight',
            name: 'Flight Simulator',
            price: 40,
            units: 1,
            description: 'HOTAS setup for Star Wars Squadrons and more',
            ageReq: 'All ages',
            color: '#2D9E49',
            maxPerBooking: 1
        }
    },

    // Operating hours
    openHour: 10,
    closeHour: 22,

    // Booking rules
    minAdvanceHours: 2, // Minimum hours in advance to book
    maxAdvanceDays: 30, // Maximum days in advance to book

    // Payment options
    paymentOptions: {
        venue: { label: 'Pay at Venue', description: 'Pay when you arrive' },
        deposit: { label: 'Pay Deposit', description: '50% now, rest at venue' },
        now: { label: 'Pay in Full', description: 'Complete payment now' }
    }
};

// Helper to check if API is configured
export const isApiConfigured = () => {
    return bookingConfig.API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
        && bookingConfig.API_URL.includes('script.google.com');
};

// API functions
export const bookingApi = {
    // Fetch availability for a date and station
    async getAvailability(date: string, station: string) {
        if (!isApiConfigured()) {
            console.warn('Booking API not configured - using demo mode');
            return null;
        }

        const url = `${bookingConfig.API_URL}?action=availability&date=${date}&station=${station}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch availability:', error);
            return null;
        }
    },

    // Create a booking
    async createBooking(bookingData: {
        date: string;
        time: string;
        station: string;
        drivers: number;
        name: string;
        email: string;
        phone: string;
        paymentMethod: string;
        notes?: string;
    }) {
        if (!isApiConfigured()) {
            console.warn('Booking API not configured - using demo mode');
            // Return mock success for demo
            return {
                success: true,
                bookingId: 'DEMO-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                message: 'Demo booking created (API not configured)'
            };
        }

        try {
            // Use GET request with URL params to avoid CORS issues with Google Apps Script
            const params = new URLSearchParams({
                action: 'book',
                date: bookingData.date,
                time: bookingData.time,
                station: bookingData.station,
                drivers: bookingData.drivers.toString(),
                name: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone,
                paymentMethod: bookingData.paymentMethod,
                notes: bookingData.notes || ''
            });

            const url = `${bookingConfig.API_URL}?${params.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to create booking:', error);
            throw error;
        }
    },

    // Get user's bookings by email
    async getUserBookings(email: string) {
        try {
            const params = new URLSearchParams({
                action: 'userBookings',
                email: email
            });

            const url = `${bookingConfig.API_URL}?${params.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch user bookings:', error);
            throw error;
        }
    },

    // Cancel a booking
    async cancelBooking(bookingId: string) {
        try {
            const params = new URLSearchParams({
                action: 'cancel',
                id: bookingId
            });

            const url = `${bookingConfig.API_URL}?${params.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            throw error;
        }
    }
};

export default bookingConfig;
