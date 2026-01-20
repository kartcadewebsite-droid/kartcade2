# Form Setup Guide

The template includes two forms that need a backend to receive submissions:
1. **Contact Form** (`pages/Contact.tsx`)
2. **Express Launch Form** (`pages/ExpressLaunchPage.tsx`)

## Option 1: Formspree (Recommended - Easy)

[Formspree](https://formspree.io) is the easiest option. No coding required.

### Setup:
1. Create free account at formspree.io
2. Create new form, get your form ID
3. Update files:

```typescript
// In Contact.tsx and ExpressLaunchPage.tsx
const FORM_ENDPOINT_URL = 'https://formspree.io/f/YOUR_FORM_ID';
```

4. Change `mode: 'no-cors'` to `mode: 'cors'` in fetch options

### Pricing:
- Free: 50 submissions/month
- Paid: Unlimited from $10/month

---

## Option 2: Google Apps Script (Free)

Free but requires more setup.

### Step 1: Create Google Sheet
1. Go to sheets.google.com
2. Create new spreadsheet
3. Add headers: Name, Email, Service, Budget, Date

### Step 2: Create Script
1. In sheet: Extensions > Apps Script
2. Replace code with:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.name,
    data.email,
    data.service || '',
    data.budget || '',
    new Date()
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Deploy
1. Click Deploy > New deployment
2. Select "Web app"
3. Execute as: Me
4. Who has access: Anyone
5. Copy the URL

### Step 4: Update Template
```typescript
const FORM_ENDPOINT_URL = 'YOUR_GOOGLE_SCRIPT_URL';
```

---

## Option 3: EmailJS

[EmailJS](https://emailjs.com) sends form data directly to your email.

### Setup:
1. Create account at emailjs.com
2. Add email service (Gmail, etc.)
3. Create email template
4. Get your Service ID, Template ID, Public Key

### Install SDK:
```bash
npm install @emailjs/browser
```

### Update Form:
```typescript
import emailjs from '@emailjs/browser';

const handleSubmit = async (e) => {
  e.preventDefault();
  await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', formData, 'PUBLIC_KEY');
};
```

---

## Option 4: Your Own API

If you have a backend, point to your endpoint:

```typescript
const FORM_ENDPOINT_URL = 'https://yourapi.com/contact';
```

Make sure your API:
- Accepts POST requests
- Handles JSON body
- Returns appropriate response

---

## Testing Forms

After setup:
1. Fill out form with test data
2. Check if data arrives (email, sheet, etc.)
3. Verify success message displays
