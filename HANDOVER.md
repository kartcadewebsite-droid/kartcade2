# 📦 Project Handover Guide (Free Plan Method)

You are on the **Free (Hobby)** plan. This means you cannot "transfer" a Vercel project directly.
Instead, the client must **Import** the project into their own account. This is better for you because they take full responsibility!

---

## 🟢 STEP 1: GitHub Transfer (Give them the code)
You need to give the client access to the code so they can see it.

1.  Go to your **GitHub Repository** page.
2.  Click **Settings** (Top bar) -> **Collaborators** (Left menu).
3.  Click **"Add people"**.
4.  Enter the Client's **GitHub Username** (or email).
5.  **Important:** Select "Admin" or "Write" access.
6.  Send them the invite link (or tell them to check email).

*(Alternative: You can "Transfer Ownership" in Settings > General > Danger Zone, but just adding them as a Collaborator is safer/easier for now).*

---

## 🟢 STEP 2: Vercel Deploy (Client does this)
Tell the client to follow these exact steps:

1.  **Log in** to [Vercel.com](https://vercel.com).
2.  Click **"Add New..."** -> **"Project"**.
3.  Next to "Import Git Repository", click **Adjust GitHub App Permissions** if they don't see `Kartcade` yet.
4.  Select `Kartcade` and click **Import**.
5.  **🛑 STOP! Do not click Deploy yet.**
6.  Click **"Environment Variables"** to expand it.
7.  Copy/Paste the Keys from the file I sent you (`.env.example`).
    *   `VITE_GEMINI_API_KEY` = (Your Key)
    *   `VITE_FIREBASE_API_KEY` = (Your Key)
    *   *(Paste all keys from your .env file)*
8.  Click **Deploy**.

---


---

## 🟢 STEP 3: Domain DNS (Final Step)
Once it is live on their Vercel (e.g., `kartcade-client.vercel.app`):

1.  They go to **Settings** -> **Domains**.
2.  Type their real domain (e.g., `kartcade.com`).
3.  Vercel will give them `A Records` and `CNAME` records.
4.  They log in to **GoDaddy/Namecheap** and add those records.
5.  **Critical:** Go to **Firebase Console -> Authentication -> Settings -> Authorized Domains** and add the new `kartcade.com` domain.

---

## 🟢 STEP 4: Payment System Setup (Critical)

### Part A: Add Keys
Ensure the client pasted these keys in Vercel **Environment Variables**:

**Backend Keys (Private):**
*   `STRIPE_SECRET_KEY` (starts with `sk_live_...`)
*   `STRIPE_WEBHOOK_SECRET` (starts with `whsec_...`) - *See Part C below*

**Frontend Keys (Public) - Must start with VITE_:**
*   `VITE_STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_...`)
*   `VITE_PAYPAL_CLIENT_ID` (from PayPal Dashboard)

### Part B: The "1-Click" Product Setup
After deployment, send the client this "Secret Link" to automatically create all membership plans:
`https://[THEIR-DOMAIN].com/api/admin/init-stripe`

*   They visit it **once**.
*   It will run for ~5 seconds and show "✅ System Setup Complete".
*   This creates all 9 pricing plans in their Stripe account automatically.

### Part C: The Webhook (One-Time Manual Step)
1.  Go to **Stripe Dashboard -> Developers -> Webhooks**.
2.  Click **Add Endpoint**.
3.  **Endpoint URL:** `https://www.[THEIR-DOMAIN].com/api/stripe-webhook`
4.  **Events to listen for:**
    *   `checkout.session.completed`
    *   `invoice.payment_succeeded`
    *   `customer.subscription.deleted`
5.  Click **Add Endpoint**.
6.  **Copy the "Signing Secret"** (starts with `whsec_...`).
7.  Go back to **Vercel -> Settings -> Environment Variables**.
8.  Add/Edit `STRIPE_WEBHOOK_SECRET` with that value.
9.  **Redeploy** (Go to Deployments -> Redeploy) for changes to take effect.

---

**✅ DONE!** The site is now 100% theirs. You can delete it from your Vercel if you want (or keep it as backup).
