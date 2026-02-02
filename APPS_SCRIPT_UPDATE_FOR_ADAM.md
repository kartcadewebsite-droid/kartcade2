# Kartcade - Google Apps Script Update Instructions

## For: Adam (or whoever has Apps Script access)

### What Needs to Be Done
Add a new function to the existing Apps Script that powers the Kartcade booking system.

### Steps:

1. **Open the Google Sheet** (Kartcade Bookings)

2. **Go to Extensions → Apps Script**

3. **Find the main script file** (usually Code.gs or similar)

4. **Add this new handler** in the `handleRequest` function (around line 95-100):

```javascript
// 7. ALL Bookings (Admin Dashboard)
if (action === 'allBookings') {
    return getAllBookings();
}
```

5. **Add this new function** at the END of the file (after `getUserBookings`):

```javascript
// ============================================================
// ADMIN: GET ALL BOOKINGS (For Admin Dashboard)
// ============================================================
function getAllBookings() {
    const rows = BOOKINGS_SHEET.getDataRange().getValues();
    const today = new Date();
    const todayStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
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
    
    const sortByDateTime = (a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
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
```

6. **Save** (Ctrl+S)

7. **Deploy** → **Manage deployments** → **Edit (pencil icon)** → **Version: New version** → **Deploy**

### What This Does
- Adds an Admin Dashboard to the website
- Shows ALL bookings (Today / Upcoming / Past)
- Auto-refreshes every 30 seconds

### Contact
If you have questions, contact Devansh.
