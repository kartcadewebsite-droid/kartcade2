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

        // Cancel booking action
        if (action === 'cancel') {
            const bookingId = e.parameter.id;
            if (!bookingId) {
                return createResponse({ error: 'Missing booking ID' }, 400);
            }
            return cancelBooking(bookingId);
        }

        // Get booking details (for cancel page)
        if (action === 'getBooking') {
            const bookingId = e.parameter.id;
            if (!bookingId) {
                return createResponse({ error: 'Missing booking ID' }, 400);
            }
            return getBookingDetails(bookingId);
        }

        // Get user's bookings by email
        if (action === 'userBookings') {
            const email = e.parameter.email;
            if (!email) {
                return createResponse({ error: 'Missing email' }, 400);
            }
            return getUserBookings(email);
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

    // Create Google Calendar event
    var calendarEventId = null;
    try {
        calendarEventId = createCalendarEvent(data, bookingId, station.name);
    } catch (calError) {
        console.error('Calendar event failed:', calError);
    }

    return createResponse({
        success: true,
        bookingId: bookingId,
        calendarEventId: calendarEventId,
        message: 'Booking confirmed!'
    });
}

// Send confirmation email to customer
function sendConfirmationEmail(data, bookingId, stationName) {
    const station = STATIONS[data.station];
    const price = getSetting(station.priceKey);
    const total = price * data.drivers;
    const cancelUrl = `https://kartcade.vercel.app/cancel?id=${bookingId}`;

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEED TO CANCEL?
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Click here to cancel: ${cancelUrl}
(24 hours notice required)

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

    // Owner notification email - UPDATE THIS FOR PRODUCTION
    const ownerEmail = 'kartcade.website@gmail.com'; // Booking notifications sent here

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

// Create Google Calendar event for the booking
function createCalendarEvent(data, bookingId, stationName) {
    // Use default calendar (owner's primary calendar)
    var calendar = CalendarApp.getDefaultCalendar();

    // Parse date and time
    var dateParts = data.date.split('-'); // yyyy-MM-dd
    var timeParts = data.time.split(':'); // HH:mm

    var year = parseInt(dateParts[0]);
    var month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
    var day = parseInt(dateParts[2]);
    var hour = parseInt(timeParts[0]);
    var minute = parseInt(timeParts[1]) || 0;

    var startTime = new Date(year, month, day, hour, minute, 0);
    var endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // 1 hour session

    // Create event title
    var title = '🏎️ ' + data.name + ' - ' + stationName + ' (' + data.drivers + ' driver' + (data.drivers > 1 ? 's' : '') + ')';

    // Create event description
    var description = 'KARTCADE BOOKING\n\n' +
        'Booking ID: ' + bookingId + '\n' +
        'Customer: ' + data.name + '\n' +
        'Email: ' + data.email + '\n' +
        'Phone: ' + data.phone + '\n\n' +
        'Station: ' + stationName + '\n' +
        'Drivers: ' + data.drivers + '\n' +
        'Payment: ' + (data.paymentMethod || 'At venue') + '\n';

    if (data.notes) {
        description += '\nNotes: ' + data.notes;
    }

    // Create the calendar event
    var event = calendar.createEvent(title, startTime, endTime, {
        description: description,
        location: 'Kartcade, West Linn, Oregon'
    });

    // Set event color based on station type
    // 1=Blue, 2=Green, 3=Purple, 4=Red, 5=Yellow, 6=Orange, 7=Turquoise, 8=Gray, 9=Bold Blue, 10=Bold Green, 11=Bold Red
    var colorMap = {
        'Racing Karts': '2',       // Green
        'Full-Size Rigs': '9',     // Bold Blue
        'Motion Simulator': '11',  // Bold Red
        'Flight Simulator': '5'    // Yellow
    };

    if (colorMap[stationName]) {
        event.setColor(colorMap[stationName]);
    }

    return event.getId();
}

// Create JSON response with CORS headers
function createResponse(data, status = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
}

// ============================================================
// CANCELLATION FUNCTIONS
// ============================================================

// Get booking details by ID (for cancel page)
function getBookingDetails(bookingId) {
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();

    for (let i = 1; i < bookings.length; i++) {
        if (bookings[i][0] === bookingId) {
            const row = bookings[i];
            return createResponse({
                success: true,
                booking: {
                    id: row[0],
                    date: row[1] instanceof Date ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : row[1],
                    time: row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'HH:mm') : row[2],
                    station: row[3],
                    drivers: row[4],
                    name: row[5],
                    email: row[6],
                    phone: row[7],
                    paymentMethod: row[8],
                    status: row[9]
                }
            });
        }
    }

    return createResponse({ error: 'Booking not found' }, 404);
}

// Get all bookings for a specific user email
function getUserBookings(email) {
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();
    const userBookings = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i < bookings.length; i++) {
        const row = bookings[i];
        const bookingEmail = row[6];
        const status = row[9];

        // Match email (case-insensitive)
        if (bookingEmail && bookingEmail.toString().toLowerCase() === email.toLowerCase()) {
            // Parse date
            let bookingDate;
            if (row[1] instanceof Date) {
                bookingDate = row[1];
            } else {
                bookingDate = new Date(row[1]);
            }

            // Only include future bookings that are not cancelled
            if (bookingDate >= today && status !== 'Cancelled') {
                userBookings.push({
                    id: row[0],
                    date: row[1] instanceof Date ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : row[1],
                    time: row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'HH:mm') : row[2],
                    station: row[3],
                    drivers: row[4],
                    name: row[5],
                    email: row[6],
                    phone: row[7],
                    status: row[9]
                });
            }
        }
    }

    // Sort by date (earliest first)
    userBookings.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    return createResponse({
        success: true,
        bookings: userBookings,
        count: userBookings.length
    });
}

// Cancel a booking
function cancelBooking(bookingId) {
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();

    for (let i = 1; i < bookings.length; i++) {
        if (bookings[i][0] === bookingId) {
            const row = bookings[i];
            const currentStatus = row[9];

            // Check if already cancelled
            if (currentStatus === 'Cancelled') {
                return createResponse({ error: 'Booking already cancelled' }, 400);
            }

            // Update status to Cancelled
            BOOKINGS_SHEET.getRange(i + 1, 10).setValue('Cancelled');

            // Get booking details for email
            const bookingData = {
                id: row[0],
                date: row[1] instanceof Date ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd') : row[1],
                time: row[2] instanceof Date ? Utilities.formatDate(row[2], Session.getScriptTimeZone(), 'HH:mm') : row[2],
                station: row[3],
                drivers: row[4],
                name: row[5],
                email: row[6],
                phone: row[7]
            };

            // Try to delete calendar event (if exists)
            try {
                deleteCalendarEvent(bookingData);
            } catch (calError) {
                console.error('Failed to delete calendar event:', calError);
            }

            // Send cancellation email to customer
            try {
                sendCancellationEmail(bookingData);
            } catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
            }

            // Notify owner
            try {
                sendOwnerCancellationNotification(bookingData);
            } catch (emailError) {
                console.error('Failed to notify owner:', emailError);
            }

            return createResponse({
                success: true,
                message: 'Booking cancelled successfully',
                bookingId: bookingId
            });
        }
    }

    return createResponse({ error: 'Booking not found' }, 404);
}

// Delete calendar event for cancelled booking
function deleteCalendarEvent(bookingData) {
    const calendar = CalendarApp.getDefaultCalendar();

    // Parse date and time
    const dateParts = bookingData.date.split('-');
    const timeParts = bookingData.time.split(':');

    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const hour = parseInt(timeParts[0]);

    const startTime = new Date(year, month, day, hour, 0, 0);
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000));

    // Find and delete events in this time range
    const events = calendar.getEvents(startTime, endTime);
    for (let event of events) {
        if (event.getTitle().includes(bookingData.name) || event.getDescription().includes(bookingData.id)) {
            event.deleteEvent();
            break;
        }
    }
}

// Send cancellation email to customer
function sendCancellationEmail(bookingData) {
    const subject = `Kartcade Booking Cancelled - ${bookingData.id}`;
    const body = `
BOOKING CANCELLATION CONFIRMATION

Your booking has been cancelled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANCELLED BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID: ${bookingData.id}
Station: ${bookingData.station}
Date: ${bookingData.date}
Time: ${bookingData.time}
Drivers: ${bookingData.drivers}

━━━━━━━━━━━━━━━━━━━━━━━━━━━

If this was a mistake or you'd like to rebook,
visit kartcade.vercel.app/book or call 503-490-9194.

- The Kartcade Team
`;

    MailApp.sendEmail(bookingData.email, subject, body);
}

// Notify owner of cancellation
function sendOwnerCancellationNotification(bookingData) {
    const ownerEmail = 'kartcade.website@gmail.com';

    const subject = `❌ Booking Cancelled: ${bookingData.name} - ${bookingData.id}`;
    const body = `
BOOKING CANCELLED

Booking ID: ${bookingData.id}
Customer: ${bookingData.name}
Email: ${bookingData.email}
Phone: ${bookingData.phone}

Station: ${bookingData.station}
Date: ${bookingData.date}
Time: ${bookingData.time}
Drivers: ${bookingData.drivers}

This time slot is now available for other bookings.
`;

    MailApp.sendEmail(ownerEmail, subject, body);
}

// Admin menu for Google Sheets
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🏎️ Kartcade')
        .addItem('Cancel Selected Booking', 'cancelSelectedBooking')
        .addToUi();
}

// Cancel booking from selected row in sheet
function cancelSelectedBooking() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const row = sheet.getActiveRange().getRow();

    if (row < 2) {
        SpreadsheetApp.getUi().alert('Please select a booking row (not the header)');
        return;
    }

    const bookingId = sheet.getRange(row, 1).getValue();

    if (!bookingId) {
        SpreadsheetApp.getUi().alert('No booking ID found in selected row');
        return;
    }

    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
        'Cancel Booking?',
        `Are you sure you want to cancel booking ${bookingId}?`,
        ui.ButtonSet.YES_NO
    );

    if (response === ui.Button.YES) {
        const result = JSON.parse(cancelBooking(bookingId).getContent());
        if (result.success) {
            ui.alert('Booking cancelled successfully!');
        } else {
            ui.alert('Error: ' + result.error);
        }
    }
}

// Test function (run this in Apps Script to test)
function testAvailability() {
    const result = getAvailability('2026-01-25', 'rigs');
    console.log(result.getContent());
}

