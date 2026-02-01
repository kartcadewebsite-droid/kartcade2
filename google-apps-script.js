// ============================================================
// KARTCADE BOOKING SYSTEM v2.0 - GOOGLE APPS SCRIPT
// ============================================================
// INSTRUCTIONS:
// 1. Paste this into your Google Apps Script editor (Extensions > Apps Script).
// 2. Create a new Sheet tab called "BlockedTimes" in your spreadsheet.
//    Columns: Date (A) | Start Time (B) | End Time (C) | Reason (D)
// 3. Deploy as Web App (Deploy > New deployment > Web app).
//    - Description: v2 with Batch & Blocking
//    - Execute as: Me
//    - Who has access: Anyone
// 4. Copy the new Web App URL and update your config/booking.ts (API_URL).
// ============================================================

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const BOOKINGS_SHEET = SPREADSHEET.getSheetByName('Bookings');
const SETTINGS_SHEET = SPREADSHEET.getSheetByName('Settings');
const BLOCKED_SHEET = SPREADSHEET.getSheetByName('BlockedTimes');

// Station configuration
const STATIONS = {
    karts: { name: 'Racing Karts', settingKey: 'TotalKarts', priceKey: 'KartPrice' },
    rigs: { name: 'Full-Size Rigs', settingKey: 'TotalRigs', priceKey: 'RigPrice' },
    motion: { name: 'Motion Simulator', settingKey: 'TotalMotion', priceKey: 'MotionPrice' },
    flight: { name: 'Flight Simulator', settingKey: 'TotalFlight', priceKey: 'FlightPrice' }
};

// ============================================================
// CORE HANDLERS
// ============================================================

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    // Determine if it's JSON or Parameter
    let params = e;
    if (e.postData && e.postData.contents) {
        const data = JSON.parse(e.postData.contents);
        params = { parameter: data };
    }
    return handleRequest(params);
}

function handleRequest(e) {
    try {
        const action = e.parameter.action;

        // 1. Availability
        if (action === 'availability') {
            return getAvailability(e.parameter.date, e.parameter.station, e.parameter.duration);
        }

        // 2. Settings
        if (action === 'settings') {
            return getSettings();
        }

        // 3. Batch Booking (New Multi-Item Flow)
        if (action === 'batchBook') {
            const items = JSON.parse(e.parameter.items || '[]');
            const userDetails = {
                name: e.parameter.name,
                email: e.parameter.email,
                phone: e.parameter.phone,
                paymentMethod: e.parameter.paymentMethod || 'venue',
                notes: e.parameter.notes || ''
            };
            return createBatchBooking(items, userDetails);
        }

        // 4. Single Booking (Legacy / Webhook Fallback)
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

        // 5. User Bookings (Dashboard)
        if (action === 'userBookings') {
            return getUserBookings(e.parameter.email);
        }

        // 6. Cancel Booking
        if (action === 'cancel') {
            return cancelBooking(e.parameter.id);
        }

        return createResponse({ error: 'Invalid action' }, 400);

    } catch (error) {
        return createResponse({ error: error.message }, 500);
    }
}

// ============================================================
// AVAILABILITY LOGIC (With BlockedTimes Support)
// ============================================================

function getAvailability(dateStr, stationId, durationStr) {
    const duration = parseInt(durationStr) || 1;

    // Optimized: Fetch all stations if no specific station requested
    if (!stationId || stationId === 'all') {
        const result = {};
        for (const key in STATIONS) {
            result[key] = getAvailabilityForStation(dateStr, key, duration);
        }
        return createResponse({ success: true, date: dateStr, availability: result });
    }

    const avail = getAvailabilityForStation(dateStr, stationId, duration);
    return createResponse({
        date: dateStr,
        station: stationId,
        availability: avail
    });
}

function getAvailabilityForStation(dateStr, stationId, duration) {
    const station = STATIONS[stationId];
    if (!station) return {};

    const totalUnits = getSetting(station.settingKey) || 1;
    const openHour = getSetting('OpenHour') || 10;
    const closeHour = getSetting('CloseHour') || 22;

    const bookedSlots = {};

    // 1. Get Existing Bookings
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();
    for (let i = 1; i < bookings.length; i++) {
        const row = bookings[i];
        if (row[9] === 'Cancelled') continue;

        const bDate = normalizeDate(row[1]);
        const bTime = normalizeTime(row[2]);
        // Normalize station name
        const bStation = String(row[3]).trim().toLowerCase();

        if (bDate === dateStr && bStation === station.name.toLowerCase()) {
            if (!bookedSlots[bTime]) bookedSlots[bTime] = 0;
            bookedSlots[bTime] += (parseInt(row[4]) || 1);
        }
    }

    // 2. Check Global Blocked Times
    const blocked = getBlockedSlots(dateStr);

    // 3. Build Availability Map
    const availability = {};
    for (let hour = openHour; hour < closeHour; hour++) {
        const timeStr = `${hour}:00`;
        let isAvailable = true;
        let minAvailableMsg = totalUnits;

        // Check if this BLOCK (hour + duration) is valid
        for (let d = 0; d < duration; d++) {
            const checkHour = hour + d;

            // Check Closing Time
            if (checkHour >= closeHour) {
                isAvailable = false;
                minAvailableMsg = 0;
                break;
            }

            const checkTimeStr = `${checkHour}:00`;

            // Check Global Block
            if (blocked.includes(checkTimeStr)) {
                isAvailable = false;
                minAvailableMsg = 0;
                break;
            }

            // Check Capacity
            const booked = bookedSlots[checkTimeStr] || 0;
            const remaining = Math.max(0, totalUnits - booked);

            if (remaining <= 0) {
                isAvailable = false;
                minAvailableMsg = 0;
                break;
            }

            minAvailableMsg = Math.min(minAvailableMsg, remaining);
        }

        availability[timeStr] = {
            total: totalUnits,
            available: isAvailable ? minAvailableMsg : 0
        };
    }

    return availability;
}

function getBlockedSlots(dateStr) {
    if (!BLOCKED_SHEET) return [];

    const blocked = [];
    const rows = BLOCKED_SHEET.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        // Col A: Date, Col B: Start, Col C: End
        if (!row[0]) continue;

        const bDate = normalizeDate(row[0]);
        if (bDate !== dateStr) continue;

        const startHour = parseHour(row[1]);
        const endHour = parseHour(row[2]);

        if (startHour !== null && endHour !== null) {
            for (let h = startHour; h < endHour; h++) {
                blocked.push(`${h}:00`);
            }
        }
    }
    return blocked;
}

// ============================================================
// BOOKING CREATION
// ============================================================

function createBatchBooking(items, user) {
    const bookingId = generateBookingId();
    const createdAt = new Date();

    // items: [{ station: 'karts', date, time, drivers }, ...]
    const bookedItems = [];
    let totalPrice = 0;

    for (const item of items) {
        const station = STATIONS[item.station];
        if (!station) continue;

        // Add Row
        BOOKINGS_SHEET.appendRow([
            bookingId,
            item.date,
            item.time,
            station.name,
            item.drivers,
            user.name,
            user.email,
            user.phone,
            user.paymentMethod,
            'Confirmed',
            createdAt
        ]);

        const price = getSetting(station.priceKey) || 0;
        totalPrice += (price * item.drivers);

        bookedItems.push({
            name: station.name,
            date: item.date,
            time: item.time,
            drivers: item.drivers
        });

        // Calendar: Create event per item to ensure calendar reflects blocked slots accurately
        // (Merging them is cleaner for human, but separate events ensures calendar says "Karts" and "Rigs")
        createCalendarEvent({
            name: user.name,
            email: user.email,
            phone: user.phone,
            date: item.date,
            time: item.time,
            drivers: item.drivers,
            notes: user.notes
        }, bookingId, station.name);
    }

    // Send Consolidated Email
    sendBatchEmail(user, bookingId, bookedItems, totalPrice);
    sendOwnerBatchNotification(user, bookingId, bookedItems, totalPrice);

    return createResponse({
        success: true,
        bookingId: bookingId,
        message: 'Batch booking confirmed'
    });
}

function createBooking(data) {
    // Legacy support for single booking calls (e.g. from existing Webhook logic)
    // We maintain this so the current "Deposit safety net" still works without frontend changes immediately.

    const station = STATIONS[data.station];
    if (!station) return createResponse({ error: 'Invalid station' }, 400);

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
    try { sendConfirmationEmail(data, bookingId, station.name); } catch (e) { }
    try { sendOwnerNotification(data, bookingId, station.name); } catch (e) { }
    try { createCalendarEvent(data, bookingId, station.name); } catch (e) { }

    return createResponse({
        success: true,
        bookingId: bookingId,
        message: 'Booking confirmed!'
    });
}

// ============================================================
// NOTIFICATIONS
// ============================================================

function sendBatchEmail(user, bookingId, items, total) {
    const subject = `Kartcade Booking Confirmed - ${bookingId}`;
    let itemsHtml = items.map(i =>
        `- ${i.name}: ${i.date} @ ${i.time} (${i.drivers} drivers)`
    ).join('\n');

    const body = `
🏎️ KARTCADE BOOKING CONFIRMATION

Booking ID: ${bookingId}
Total: $${total}

ITEMS RESERVED:
${itemsHtml}

Payment: ${user.paymentMethod}

📍 Location: West Linn, Oregon
📞 Questions? Call 503-490-9194
    `;
    MailApp.sendEmail(user.email, subject, body);
}

function sendOwnerBatchNotification(user, bookingId, items, total) {
    const ownerEmail = 'kartcade.website@gmail.com';
    const subject = `🏎️ New BATCH Booking: ${user.name}`;
    let itemsHtml = items.map(i =>
        `- ${i.name}: ${i.date} @ ${i.time} (${i.drivers})`
    ).join('\n');
    const body = `
NEW BOOKING
User: ${user.name} (${user.email})
Phone: ${user.phone}

${itemsHtml}

Total: $${total}
Notes: ${user.notes}
    `;
    MailApp.sendEmail(ownerEmail, subject, body);
}

function sendConfirmationEmail(data, bookingId, stationName) {
    const station = STATIONS[data.station];
    const price = getSetting(station.priceKey);
    const total = price * data.drivers;
    const body = `Booking ID: ${bookingId}\n${stationName}\n${data.date} @ ${data.time}\nTotal: $${total}\n\n- Kartcade Team`;
    MailApp.sendEmail(data.email, `Kartcade Booking - ${bookingId}`, body);
}

function sendOwnerNotification(data, bookingId, stationName) {
    const ownerEmail = 'kartcade.website@gmail.com';
    MailApp.sendEmail(ownerEmail, `New Booking: ${data.name}`, `Details:\n${stationName}\nID: ${bookingId}\nUser: ${data.name}`);
}

function createCalendarEvent(data, bookingId, stationName) {
    var calendar = CalendarApp.getDefaultCalendar();

    // Parse Date Parts YYYY-MM-DD
    var dateParts = data.date.split('-');
    // Parse Time Parts HH:mm
    var timeParts = data.time.split(':');

    var start = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1] || 0);
    var end = new Date(start.getTime() + (3600 * 1000)); // 1 Hour

    var event = calendar.createEvent(`🏎️ ${data.name} - ${stationName} (${data.drivers})`, start, end, {
        description: `ID: ${bookingId}\n${data.notes}`
    });

    // Colors: Karts=2(Green), Rigs=9(Blue), Motion=11(Red), Flight=5(Yellow)
    var colorMap = { 'Racing Karts': '2', 'Full-Size Rigs': '9', 'Motion Simulator': '11', 'Flight Simulator': '5' };
    if (colorMap[stationName]) event.setColor(colorMap[stationName]);
}

// ============================================================
// HELPERS
// ============================================================

function generateBookingId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'K';
    for (let i = 0; i < 5; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}

function getSetting(key) {
    const data = SETTINGS_SHEET.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
        if (data[i][0] === key) return data[i][1];
    }
    return null;
}

function normalizeDate(val) {
    if (val instanceof Date) {
        return Utilities.formatDate(val, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
    }
    if (typeof val === 'string' && val.includes('T')) return val.split('T')[0];
    return String(val).trim(); // Basic string normalization
}

function normalizeTime(val) {
    if (val instanceof Date) {
        return Utilities.formatDate(val, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'HH:mm');
    }
    return String(val).substring(0, 5);
}

function parseHour(val) {
    const t = normalizeTime(val);
    const parts = t.split(':');
    return parseInt(parts[0]);
}

function createResponse(data, status = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

function cancelBooking(id) {
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();
    for (let i = 1; i < bookings.length; i++) {
        if (bookings[i][0] === id) {
            BOOKINGS_SHEET.getRange(i + 1, 10).setValue('Cancelled');
            return createResponse({ success: true });
        }
    }
    return createResponse({ error: 'Not found' });
}

function getUserBookings(email) {
    // Only basic logic here to prevent massive file size, assumes exact match
    const rows = BOOKINGS_SHEET.getDataRange().getValues();
    const result = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][6]).toLowerCase() === email.toLowerCase() && rows[i][9] !== 'Cancelled') {
            // Basic date filter to hide old stuff
            if (normalizeDate(rows[i][1]) >= today) {
                result.push({
                    id: rows[i][0],
                    date: normalizeDate(rows[i][1]),
                    time: normalizeTime(rows[i][2]),
                    station: rows[i][3],
                    drivers: rows[i][4],
                    status: rows[i][9]
                });
            }
        }
    }
    return createResponse({ success: true, bookings: result });
}
