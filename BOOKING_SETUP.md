# Kartcade Booking System Setup Guide

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named: **"Kartcade Bookings"**
3. Create 2 sheets (tabs at bottom):

### Sheet 1: "Bookings" (rename Sheet1)
Add these headers in Row 1:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| BookingID | Date | Time | Station | Drivers | CustomerName | Email | Phone | PaymentMethod | Status | CreatedAt |

### Sheet 2: "Settings" (create new tab)
Add this data:

| A | B |
|---|---|
| Setting | Value |
| TotalKarts | 5 |
| TotalRigs | 3 |
| TotalMotion | 1 |
| TotalFlight | 1 |
| OpenHour | 10 |
| CloseHour | 22 |
| KartPrice | 30 |
| RigPrice | 40 |
| MotionPrice | 50 |
| FlightPrice | 40 |

---

## Step 2: Create Google Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete any existing code
3. Paste the entire code from `google-apps-script.js` file (I'll create this next)
4. Click **Save** (name it "Kartcade Booking API")
5. Click **Deploy → New deployment**
6. Choose **Web app**
7. Set:
   - Description: "Kartcade Booking API"
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. **IMPORTANT**: Copy the Web App URL (looks like: `https://script.google.com/macros/s/XXXXX/exec`)

---

## Step 3: Update Website

1. Open `config/booking.ts`
2. Paste your Web App URL where indicated
3. Save and refresh the website

---

## Testing

1. Go to `/book` on your website
2. Complete a booking
3. Check your Google Sheet - the booking should appear!

---

## How It Works

```
Website (React) 
    ↓ API Call
Google Apps Script
    ↓ Read/Write
Google Sheets (Database)
```

- **GET request** → Returns availability for a given date
- **POST request** → Creates new booking
- Sheet updates in real-time
- Owner can view/edit bookings directly in Google Sheets
