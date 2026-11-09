# BYD Properties — Setup Guide

## Prerequisites

1. **Install Node.js** (v18 or later):
   Download from: https://nodejs.org/en/download/

2. Restart your terminal after installing Node.js

## Getting Started

```bash
# Navigate to the project folder
cd "D:/New folder/website"

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open your browser at: **http://localhost:3000**

---

## Admin Dashboard

Access at: **http://localhost:3000/admin**

**Default credentials** (change in `.env.local` before going live):
- Email: `admin@bydproperties.com`
- Password: `Admin@BYD2024`

---

## Environment Variables (`.env.local`)

| Variable | Description |
|---|---|
| `NEXTAUTH_URL` | Your site URL (e.g. `http://localhost:3000` or production URL) |
| `NEXTAUTH_SECRET` | Secret key used for JWT encryption and HMAC OTP generation |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret (required for administrative database operations & bypassing RLS) |
| `RESEND_API_KEY` | Resend API key for sending transactional OTP and approval emails |
| `EMAIL_FROM` | Sender email address (default: `BYD Properties <alerts@bydproperties.rw>`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (e.g. `https://www.bydproperties.rw`) |

---

## Database Migration (Agent OTP & Approval System)

To support the agent registration, OTP email verification, and administrator approval system in Supabase:

1. Open your **Supabase Dashboard** > **SQL Editor**.
2. Run the script located at: `scripts/setup_agent_otp_schema.sql`
3. This creates or updates:
   - `agents` table with new status columns (`account_status`, `rejection_reason`, `approved_at`, `approved_by`, `email_verified_at`, etc.)
   - `otp_verifications` table (securely stores HMAC-SHA256 hashed OTPs, expiration, and attempt counts)
   - Performance and lookup indexes

*(Note: When running without Supabase credentials in local development, the system automatically falls back to local data storage in `data/agents.json` and `data/otps.json`)*

---

## Project Structure

```
app/
├── page.js              → Home page
├── properties/page.js   → Properties listing
├── services/page.js     → Services
├── about/page.js        → About
├── contact/page.js      → Contact
└── admin/
    ├── page.js          → Dashboard overview
    ├── properties/      → CRUD for properties
    ├── inquiries/       → View & manage inquiries
    ├── agents/          → Agent applications
    └── content/         → Edit page content

components/
├── Navbar.jsx
├── Footer.jsx            ← Includes "Become an Agent" button
├── WhatsAppButton.jsx
├── BecomeAgentModal.jsx  ← Agent registration form
├── PropertyCard.jsx
├── AnimatedSection.jsx
└── admin/
    ├── Sidebar.jsx
    └── PropertyForm.jsx

data/                     ← JSON file database (auto-updated)
├── properties.json
├── inquiries.json
├── agents.json
└── content.json
```

---

## Build for Production

```bash
npm run build
npm start
```
