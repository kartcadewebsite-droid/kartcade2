// ============================================================
// KARTCADE BOOKING SYSTEM - GOOGLE APPS SCRIPT
// ============================================================
// Deploy this as a Web App in Google Apps Script
// 1. Extensions → Apps Script (from your Google Sheet)
// 2. Paste this code
// 3. Deploy → New deployment → Web app
// 4. Execute as: Me, Who has access: Anyone
// 5. Copy the Web App URL and paste in config/booking.ts
// ============================================================

// Get the active spreadsheet
const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const BOOKINGS_SHEET = SPREADSHEET.getSheetByName('Bookings');
const SETTINGS_SHEET = SPREADSHEET.getSheetByName('Settings');

// Station configuration
const STATIONS = {
    karts: { name: 'Racing Karts', settingKey: 'TotalKarts', priceKey: 'KartPrice' },
    rigs: { name: 'Full-Size Rigs', settingKey: 'TotalRigs', priceKey: 'RigPrice' },
    motion: { name: 'Motion Simulator', settingKey: 'TotalMotion', priceKey: 'MotionPrice' },
    flight: { name: 'Flight Simulator', settingKey: 'TotalFlight', priceKey: 'FlightPrice' }
};

// Get setting value from Settings sheet
function getSetting(key) {
    const data = SETTINGS_SHEET.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === key) {
            return data[i][1];
        }
    }
    return null;
}

// Generate unique booking ID
function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'K';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Handle GET requests (fetch availability AND create bookings)
function doGet(e) {
    try {
        const action = e.parameter.action;

        if (action === 'availability') {
            return getAvailability(e.parameter.date, e.parameter.station);
        }

        if (action === 'settings') {
            return getSettings();
        }

        // Debug action - returns raw booking data
        if (action === 'debug') {
            const bookings = BOOKINGS_SHEET.getDataRange().getValues();
            const debugData = [];
            for (let i = 1; i < Math.min(bookings.length, 10); i++) {
                const row = bookings[i];
                debugData.push({
                    bookingId: row[0],
                    date: row[1],
                    dateType: typeof row[1],
                    dateIsDate: row[1] instanceof Date,
                    time: row[2],
                    station: row[3],
                    drivers: row[4],
                    status: row[9]
                });
            }
            return createResponse({
                sheetName: BOOKINGS_SHEET ? BOOKINGS_SHEET.getName() : 'NOT_FOUND',
                totalRows: bookings.length,
                bookings: debugData
            });
        }

        // Handle booking via GET (for CORS compatibility)
        if (action === 'book') {
            const bookingData = {
                date: e.parameter.date,
                time: e.parameter.time,
                station: e.parameter.station,
                drivers: parseInt(e.parameter.drivers) || 1,
                name: e.parameter.name,
                email: e.parameter.email,
                phone: e.parameter.phone,
                paymentMethod: e.parameter.paymentMethod || 'venue',
                notes: e.parameter.notes || ''
            };
            return createBooking(bookingData);
        }

        return createResponse({ error: 'Invalid action' }, 400);
    } catch (error) {
        return createResponse({ error: error.message }, 500);
    }
}

// Handle POST requests (create booking)
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);

        if (data.action === 'book') {
            return createBooking(data);
        }

        return createResponse({ error: 'Invalid action' }, 400);
    } catch (error) {
        return createResponse({ error: error.message }, 500);
    }
}

// Get availability for a specific date and station
function getAvailability(dateStr, stationId) {
    const station = STATIONS[stationId];
    if (!station) {
        return createResponse({ error: 'Invalid station' }, 400);
    }

    const totalUnits = getSetting(station.settingKey) || 1;
    const openHour = getSetting('OpenHour') || 10;
    const closeHour = getSetting('CloseHour') || 22;

    // Get all bookings for this date and station
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();
    const bookedSlots = {};

    for (let i = 1; i < bookings.length; i++) {
        const row = bookings[i];
        const bookingDate = row[1]; // Date column
        const bookingTime = row[2]; // Time column
        const bookingStation = row[3]; // Station column
        const drivers = parseInt(row[4]) || 1; // Drivers column
        const status = row[9]; // Status column

        // Format date for comparison - Google Sheets stores as Date object
        let bookingDateStr = '';
        if (bookingDate instanceof Date) {
            // Use spreadsheet timezone for consistent date
            bookingDateStr = Utilities.formatDate(bookingDate, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
        } else if (typeof bookingDate === 'string') {
            bookingDateStr = bookingDate.toString().trim();
        }

        // Format time for comparison - Google Sheets stores time as Date object (1899-12-30 base)
        let bookingTimeStr = '';
        if (bookingTime instanceof Date) {
            // Extract just the hours
            const hours = bookingTime.getHours();
            bookingTimeStr = hours + ':00';
        } else if (typeof bookingTime === 'string') {
            bookingTimeStr = bookingTime.toString().trim();
        }

        // Check if this booking matches
        if (bookingDateStr === dateStr && bookingStation === station.name && status !== 'Cancelled') {
            if (!bookedSlots[bookingTimeStr]) {
                bookedSlots[bookingTimeStr] = 0;
            }
            bookedSlots[bookingTimeStr] += drivers;
        }
    }

    // Build availability response
    const availability = {};
    for (let hour = openHour; hour < closeHour; hour++) {
        const timeStr = `${hour}:00`;
        const booked = bookedSlots[timeStr] || 0;
        availability[timeStr] = {
            total: totalUnits,
            booked: booked,
            available: Math.max(0, totalUnits - booked)
        };
    }

    return createResponse({
        date: dateStr,
        station: stationId,
        stationName: station.name,
        totalUnits: totalUnits,
        availability: availability
    });
}

// Get all settings
function getSettings() {
    const settings = {};
    const data = SETTINGS_SHEET.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
        settings[data[i][0]] = data[i][1];
    }

    return createResponse(settings);
}

// Create a new booking
function createBooking(data) {
    // Validate required fields
    const required = ['date', 'time', 'station', 'drivers', 'name', 'email', 'phone'];
    for (const field of required) {
        if (!data[field]) {
            return createResponse({ error: `Missing required field: ${field}` }, 400);
        }
    }

    const station = STATIONS[data.station];
    if (!station) {
        return createResponse({ error: 'Invalid station' }, 400);
    }

    // Check availability before booking
    const totalUnits = getSetting(station.settingKey);
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();
    let bookedCount = 0;

    for (let i = 1; i < bookings.length; i++) {
        const row = bookings[i];
        let bookingDateStr = row[1];
        if (row[1] instanceof Date) {
            bookingDateStr = Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd');
        }

        if (bookingDateStr === data.date && row[2] === data.time && row[3] === station.name && row[9] !== 'Cancelled') {
            bookedCount += row[4];
        }
    }

    if (bookedCount + data.drivers > totalUnits) {
        return createResponse({
            error: 'Not enough availability',
            available: totalUnits - bookedCount,
            requested: data.drivers
        }, 400);
    }

    // Create booking
    const bookingId = generateBookingId();
    const createdAt = new Date();

    BOOKINGS_SHEET.appendRow([
        bookingId,
        data.date,
        data.time,
        station.name,
        data.drivers,
        data.name,
        data.email,
        data.phone,
        data.paymentMethod || 'venue',
        'Confirmed',
        createdAt
    ]);

    // Send confirmation email
    try {
        sendConfirmationEmail(data, bookingId, station.name);
    } catch (emailError) {
        // Don't fail the booking if email fails
        console.error('Email failed:', emailError);
    }

    // Send notification to owner
    try {
        sendOwnerNotification(data, bookingId, station.name);
    } catch (emailError) {
        console.error('Owner notification failed:', emailError);
    }

    return createResponse({
        success: true,
        bookingId: bookingId,
        message: 'Booking confirmed!'
    });
}

// Send confirmation email to customer
function sendConfirmationEmail(data, bookingId, stationName) {
    const station = STATIONS[data.station];
    const price = getSetting(station.priceKey);
    const total = price * data.drivers;

    const subject = `Kartcade Booking Confirmation - ${bookingId}`;
    const body = `
🏎️ KARTCADE BOOKING CONFIRMATION

Booking ID: ${bookingId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Station: ${stationName}
Date: ${data.date}
Time: ${data.time}
Drivers: ${data.drivers}
Total: $${total}

Payment: ${data.paymentMethod === 'venue' ? 'Pay at venue' : data.paymentMethod === 'deposit' ? '50% deposit' : 'Paid in full'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: West Linn, Oregon
📞 Questions? Call 503-490-9194
⏰ Please arrive 10 minutes early

Cancellation Policy: 24 hours notice required

━━━━━━━━━━━━━━━━━━━━━━━━━━━

See you at the track! 🏁

- The Kartcade Team
`;

    MailApp.sendEmail(data.email, subject, body);
}

// Send notification to owner
function sendOwnerNotification(data, bookingId, stationName) {
    const station = STATIONS[data.station];
    const price = getSetting(station.priceKey);
    const total = price * data.drivers;

    // UPDATE THIS EMAIL ADDRESS (Set to Kartcade owner's email for production)
    const ownerEmail = 'devansh7704patel@gmail.com'; // Booking notifications sent here

    const subject = `🏎️ New Booking: ${data.name} - ${bookingId}`;
    const body = `
NEW BOOKING RECEIVED

Booking ID: ${bookingId}
Customer: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

Station: ${stationName}
Date: ${data.date}
Time: ${data.time}
Drivers: ${data.drivers}
Total: $${total}
Payment: ${data.paymentMethod}

${data.notes ? 'Notes: ' + data.notes : ''}

View all bookings in Google Sheets
`;

    MailApp.sendEmail(ownerEmail, subject, body);
}

// Create JSON response with CORS headers
function createResponse(data, status = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

// Test function (run this in Apps Script to test)
function testAvailability() {
    const result = getAvailability('2026-01-25', 'rigs');
    console.log(result.getContent());
}
