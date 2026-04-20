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
| `NEXTAUTH_URL` | Your site URL (keep as `http://localhost:3000` for local) |
| `NEXTAUTH_SECRET` | Change to a long random string before going live |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |

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
