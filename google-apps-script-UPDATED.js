// ============================================================
// KARTCADE BOOKING SYSTEM v2.1 - WITH PAYMENT STATUS
// ============================================================
// CHANGES FROM v2.0:
// - Added Column L: "Payment Status" to Bookings sheet
// - Auto-calculates payment amounts on booking creation
// - Format: "Paid: $XX / Remaining: $XX"
// ============================================================

const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
const BOOKINGS_SHEET = SPREADSHEET.getSheetByName('Bookings');
const SETTINGS_SHEET = SPREADSHEET.getSheetByName('Settings');
const BLOCKED_SHEET = SPREADSHEET.getSheetByName('BlockedTimes');

// Station configuration
const STATIONS = {
    karts: { name: 'Racing Karts', settingKey: 'TotalKarts', priceKey: 'KartPrice', pricePerHour: 30 },
    rigs: { name: 'Full-Size Rigs', settingKey: 'TotalRigs', priceKey: 'RigPrice', pricePerHour: 40 },
    motion: { name: 'Motion Simulator', settingKey: 'TotalMotion', priceKey: 'MotionPrice', pricePerHour: 40 },
    flight: { name: 'Flight Simulator', settingKey: 'TotalFlight', priceKey: 'FlightPrice', pricePerHour: 45 }
};

// ============================================================
// PAYMENT CALCULATION HELPERS (NEW!)
// ============================================================

/**
 * Parse station string to extract equipment and duration
 * Format: "Racing Karts:3 (2h)" or "Karts:2, Rigs:1 (2h)"
 */
function parseStationString(stationStr) {
    const equipment = [];

    // Extract duration
    const durationMatch = String(stationStr).match(/\((\d+)h\)/);
    const duration = durationMatch ? parseInt(durationMatch[1]) : 1;

    // Remove duration from string
    const equipmentString = String(stationStr).replace(/\(\d+h\)/, '').trim();

    // Split by comma for multi-equipment
    const items = equipmentString.split(',');

    items.forEach(function (item) {
        // Match "Racing Karts:3" or "Karts:2"
        const match = item.trim().match(/(.+):(\d+)/);
        if (match) {
            equipment.push({
                type: match[1].trim(),
                quantity: parseInt(match[2])
            });
        } else {
            // LEGACY FORMAT: No quantity specified (e.g., "Racing Karts")
            // Assume single unit (quantity: 1)
            const trimmed = item.trim();
            if (trimmed) {
                equipment.push({
                    type: trimmed,
                    quantity: 1
                });
            }
        }
    });

    return { equipment: equipment, duration: duration };
}

/**
 * Get price per hour for equipment type
 */
function getEquipmentPrice(equipmentType) {
    const normalizedType = String(equipmentType).toLowerCase();

    if (normalizedType.indexOf('kart') !== -1) return 30;
    if (normalizedType.indexOf('rig') !== -1) return 40;
    if (normalizedType.indexOf('motion') !== -1) return 40;
    if (normalizedType.indexOf('flight') !== -1) return 45;

    return 30; // Default
}

/**
 * Calculate total cost from station string
 */
function calculateTotalCost(stationStr) {
    const parsed = parseStationString(stationStr);
    let total = 0;

    parsed.equipment.forEach(function (item) {
        const pricePerHour = getEquipmentPrice(item.type);
        total += item.quantity * parsed.duration * pricePerHour;
    });

    return total;
}

/**
 * Calculate paid amount based on payment method
 */
function calculatePaidAmount(paymentMethod, totalCost) {
    const method = String(paymentMethod || 'venue').toLowerCase();

    if (method === 'paypal' || method === 'credits') {
        return totalCost; // Paid in full
    } else if (method === 'deposit') {
        return Math.round(totalCost * 0.5); // 50% deposit
    } else {
        return 0; // venue - nothing paid yet
    }
}

/**
 * Generate payment status string for Google Sheet
 */
function generatePaymentStatus(stationStr, paymentMethod) {
    const total = calculateTotalCost(stationStr);
    const paid = calculatePaidAmount(paymentMethod, total);
    const remaining = total - paid;

    return 'Paid: $' + paid + ' / Remaining: $' + remaining;
}

// ============================================================
// CORE HANDLERS (UNCHANGED)
// ============================================================

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
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

        if (action === 'availability') {
            return getAvailability(e.parameter.date, e.parameter.station, e.parameter.duration);
        }

        if (action === 'settings') {
            return getSettings();
        }

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

        if (action === 'userBookings') {
            return getUserBookings(e.parameter.email);
        }

        if (action === 'cancel') {
            return cancelBooking(e.parameter.id);
        }

        if (action === 'allBookings') {
            return getAllBookings();
        }

        if (action === 'getBooking') {
            return getBooking(e.parameter.id);
        }

        return createResponse({ error: 'Invalid action' }, 400);

    } catch (error) {
        return createResponse({ error: error.message }, 500);
    }
}

// ============================================================
// AVAILABILITY LOGIC (UNCHANGED - keeping your current code)
// ============================================================

function getAvailability(dateStr, stationId, durationStr) {
    const duration = parseInt(durationStr) || 1;

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

    function extractQuantityFromBooking(stationStr, targetId) {
        const lower = String(stationStr).toLowerCase();

        const shortNames = {
            karts: 'karts',
            rigs: 'rigs',
            motion: 'motion',
            flight: 'flight'
        };

        const shortName = shortNames[targetId];
        if (!shortName) return 0;

        const regex = new RegExp(shortName + ':(\\d+)', 'i');
        const match = lower.match(regex);
        if (match) {
            return parseInt(match[1]) || 0;
        }

        if (lower === station.name.toLowerCase()) {
            return 1;
        }

        return 0;
    }

    const bookings = BOOKINGS_SHEET.getDataRange().getValues();
    for (let i = 1; i < bookings.length; i++) {
        const row = bookings[i];
        if (row[9] === 'Cancelled') continue;

        const bDate = normalizeDate(row[1]);
        const bTime = normalizeTime(row[2]);
        const bStation = String(row[3]).trim();

        const durationMatch = bStation.match(/\((\d+)h\)/);
        const bookingDuration = durationMatch ? parseInt(durationMatch[1]) : 1;

        if (bDate === dateStr) {
            const qty = extractQuantityFromBooking(bStation, stationId);

            if (qty > 0) {
                const startHour = parseInt(bTime.split(':')[0]);
                for (let h = 0; h < bookingDuration; h++) {
                    const hourKey = (startHour + h) + ':00';
                    if (!bookedSlots[hourKey]) bookedSlots[hourKey] = 0;
                    bookedSlots[hourKey] += qty;
                }
            }
        }
    }

    const blocked = getBlockedSlots(dateStr);

    const availability = {};
    for (let hour = openHour; hour < closeHour; hour++) {
        const timeStr = hour + ':00';
        let isAvailable = true;
        let minAvailableMsg = totalUnits;

        for (let d = 0; d < duration; d++) {
            const checkHour = hour + d;

            if (checkHour >= closeHour) {
                isAvailable = false;
                minAvailableMsg = 0;
                break;
            }

            const checkTimeStr = checkHour + ':00';

            if (blocked.indexOf(checkTimeStr) !== -1) {
                isAvailable = false;
                minAvailableMsg = 0;
                break;
            }

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
        if (!row[0]) continue;

        const bDate = normalizeDate(row[0]);
        if (bDate !== dateStr) continue;

        const startHour = parseHour(row[1]);
        const endHour = parseHour(row[2]);

        if (startHour !== null && endHour !== null) {
            for (let h = startHour; h < endHour; h++) {
                blocked.push(h + ':00');
            }
        }
    }
    return blocked;
}

function getSettings() {
    const settings = {};
    const rows = SETTINGS_SHEET.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
        settings[rows[i][0]] = rows[i][1];
    }
    return createResponse({ success: true, settings: settings });
}

// ============================================================
// BOOKING CREATION (UPDATED - Now includes payment status!)
// ============================================================

function createBatchBooking(items, user) {
    const bookingId = generateBookingId();
    const createdAt = new Date();

    const bookedItems = [];
    let totalPrice = 0;

    for (const i in items) {
        const item = items[i];
        const station = STATIONS[item.station];
        if (!station) continue;

        // UPDATED: Calculate payment status
        const stationName = station.name;
        const paymentStatus = generatePaymentStatus(stationName, user.paymentMethod);

        // Add Row with Payment Status (Column L)
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
            createdAt,
            paymentStatus  // NEW! Column L
        ]);

        const price = getSetting(station.priceKey) || 0;
        totalPrice += (price * item.drivers);

        bookedItems.push({
            name: station.name,
            date: item.date,
            time: item.time,
            drivers: item.drivers
        });

        createCalendarEvent({
            name: user.name,
            email: user.email,
            phone: user.phone,
            date: item.date,
            time: item.time,
            drivers: item.drivers,
            notes: user.notes
        }, bookingId, station.name, 1);
    }

    sendBatchEmail(user, bookingId, bookedItems, totalPrice);
    sendOwnerBatchNotification(user, bookingId, bookedItems, totalPrice);

    return createResponse({
        success: true,
        bookingId: bookingId,
        message: 'Batch booking confirmed'
    });
}

function createBooking(data) {
    const bookingId = generateBookingId();
    const createdAt = new Date();

    const stationDisplay = data.station || 'Unknown';

    const durationMatch = stationDisplay.match(/\((\d+)h\)/);
    const durationHours = durationMatch ? parseInt(durationMatch[1]) : 1;

    // UPDATED: Calculate payment status
    const paymentStatus = generatePaymentStatus(stationDisplay, data.paymentMethod);

    // Add Row with Payment Status (Column L)
    BOOKINGS_SHEET.appendRow([
        bookingId,
        data.date,
        data.time,
        stationDisplay,
        data.drivers,
        data.name,
        data.email,
        data.phone,
        data.paymentMethod || 'venue',
        'Confirmed',
        createdAt,
        paymentStatus  // NEW! Column L
    ]);

    try { sendConfirmationEmail(data, bookingId, stationDisplay, durationHours); } catch (e) { }
    try { sendOwnerNotification(data, bookingId, stationDisplay, durationHours); } catch (e) { }
    try { createCalendarEvent(data, bookingId, stationDisplay, durationHours); } catch (e) { }

    return createResponse({
        success: true,
        bookingId: bookingId,
        message: 'Booking confirmed!'
    });
}

// ============================================================
// NOTIFICATIONS (UNCHANGED)
// ============================================================

function sendBatchEmail(user, bookingId, items, total) {
    const subject = 'K artcade Booking Confirmed - ' + bookingId;
    let itemsHtml = items.map(function (i) {
        return '- ' + i.name + ': ' + i.date + ' @ ' + i.time + ' (' + i.drivers + ' drivers)';
    }).join('\n');

    const body = '\n🏎️ KARTCADE BOOKING CONFIRMATION\n\nBooking ID: ' + bookingId + '\nTotal: $' + total + '\n\nITEMS RESERVED:\n' + itemsHtml + '\n\nPayment: ' + user.paymentMethod + '\n\n📍 Location: West Linn, Oregon\n📞 Questions? Call 503-490-9194\n    ';
    MailApp.sendEmail(user.email, subject, body);
}

function sendOwnerBatchNotification(user, bookingId, items, total) {
    const ownerEmail = 'kartcade.website@gmail.com';
    const subject = '🏎️ New BATCH Booking: ' + user.name;
    let itemsHtml = items.map(function (i) {
        return '- ' + i.name + ': ' + i.date + ' @ ' + i.time + ' (' + i.drivers + ')';
    }).join('\n');
    const body = '\nNEW BOOKING\nUser: ' + user.name + ' (' + user.email + ')\nPhone: ' + user.phone + '\n\n' + itemsHtml + '\n\nTotal: $' + total + '\nNotes: ' + user.notes + '\n    ';
    MailApp.sendEmail(ownerEmail, subject, body);
}

function sendConfirmationEmail(data, bookingId, stationDisplay, durationHours) {
    const cancelUrl = 'https://kartcade.com/cancel?id=' + bookingId;
    const body = '\n🏎️ KARTCADE BOOKING CONFIRMATION\n\nBooking ID: ' + bookingId + '\nEquipment: ' + stationDisplay + '\nDate: ' + data.date + '\nTime: ' + data.time + '\nDuration: ' + durationHours + ' hour' + (durationHours > 1 ? 's' : '') + '\nDrivers: ' + data.drivers + '\n\n📍 Location: West Linn, Oregon\n📞 Questions? Call 503-490-9194\n\nNeed to cancel? Visit: ' + cancelUrl + '\n\nThank you for booking with Kartcade!\n- The Kartcade Team\n    ';
    MailApp.sendEmail(data.email, 'Kartcade Booking - ' + bookingId, body);
}

function sendOwnerNotification(data, bookingId, stationDisplay, durationHours) {
    const ownerEmail = 'kartcade.website@gmail.com';
    const body = '\n🏎️ NEW BOOKING\n\nID: ' + bookingId + '\nCustomer: ' + data.name + '\nEmail: ' + data.email + '\nPhone: ' + data.phone + '\n\nEquipment: ' + stationDisplay + '\nDate: ' + data.date + '\nTime: ' + data.time + ' (' + durationHours + 'hr)\nDrivers: ' + data.drivers + '\nPayment: ' + data.paymentMethod + '\nNotes: ' + (data.notes || 'None') + '\n    ';
    MailApp.sendEmail(ownerEmail, 'New Booking: ' + data.name + ' - ' + stationDisplay, body);
}

function createCalendarEvent(data, bookingId, stationDisplay, durationHours) {
    var calendar = CalendarApp.getDefaultCalendar();

    var dateParts = data.date.split('-');
    var timeParts = data.time.split(':');

    var start = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1] || 0);
    var end = new Date(start.getTime() + (durationHours * 3600 * 1000));

    var event = calendar.createEvent('🏎️ ' + data.name + ' - ' + stationDisplay, start, end, {
        description: 'Booking ID: ' + bookingId + '\nDrivers: ' + data.drivers + '\nPhone: ' + data.phone + '\nEmail: ' + data.email + '\n\nNotes: ' + (data.notes || 'None')
    });

    event.setColor('2');
}

// ============================================================
// HELPERS (UNCHANGED)
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
    if (typeof val === 'string' && val.indexOf('T') !== -1) return val.split('T')[0];
    return String(val).trim();
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

function createResponse(data, status) {
    status = status || 200;
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

function getBooking(id) {
    const bookings = BOOKINGS_SHEET.getDataRange().getValues();
    for (let i = 1; i < bookings.length; i++) {
        if (bookings[i][0] === id) {
            return createResponse({
                success: true,
                booking: {
                    id: bookings[i][0],
                    date: normalizeDate(bookings[i][1]),
                    time: normalizeTime(bookings[i][2]),
                    station: bookings[i][3],
                    drivers: bookings[i][4],
                    name: bookings[i][5],
                    email: bookings[i][6],
                    phone: bookings[i][7],
                    paymentMethod: bookings[i][8],
                    status: bookings[i][9]
                }
            });
        }
    }
    return createResponse({ success: false, error: 'Booking not found' });
}

function getUserBookings(email) {
    const rows = BOOKINGS_SHEET.getDataRange().getValues();
    const result = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][6]).toLowerCase() === email.toLowerCase() && rows[i][9] !== 'Cancelled') {
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

function getAllBookings() {
    const rows = BOOKINGS_SHEET.getDataRange().getValues();
    const today = new Date();
    const todayStr = Utilities.formatDate(today, 'America/Los_Angeles', 'yyyy-MM-dd');

    const todayBookings = [];
    const upcomingBookings = [];
    const pastBookings = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const bookingDate = normalizeDate(row[1]);
        const status = row[9] || 'Pending';

        const booking = {
            id: row[0],
            date: bookingDate,
            time: normalizeTime(row[2]),
            station: row[3],
            drivers: row[4],
            name: row[5],
            email: row[6],
            phone: row[7],
            paymentMethod: row[8],
            status: status
        };

        if (status === 'Cancelled') {
            pastBookings.push(booking);
            continue;
        }

        if (bookingDate === todayStr) {
            todayBookings.push(booking);
        } else if (bookingDate > todayStr) {
            upcomingBookings.push(booking);
        } else {
            pastBookings.push(booking);
        }
    }

    const sortByDateTime = function (a, b) {
        if (a.date !== b.date) return a.date > b.date ? 1 : -1;
        return a.time > b.time ? 1 : -1;
    };

    todayBookings.sort(sortByDateTime);
    upcomingBookings.sort(sortByDateTime);
    pastBookings.sort(sortByDateTime).reverse();

    return createResponse({
        success: true,
        today: todayBookings,
        upcoming: upcomingBookings,
        past: pastBookings.slice(0, 50),
        stats: {
            todayCount: todayBookings.length,
            upcomingCount: upcomingBookings.length,
            pastCount: pastBookings.length
        }
    });
}
