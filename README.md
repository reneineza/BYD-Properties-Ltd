# BYD Properties — Premium Real Estate & Construction Platform

> Rwanda's trusted partner in premium real estate, construction, and property development since 2010.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

**Live Site:** [www.bydproperties.rw](https://www.bydproperties.rw)

---

## Overview

BYD Properties is a full-stack real estate web platform built with **Next.js 14 App Router**. It showcases luxury properties for sale and rent in Kigali, Rwanda, and includes a comprehensive admin dashboard for managing listings, inquiries, leads, and site content.

### Key Highlights

- 🏠 **Property Listings** — Browse, filter, and search properties with a full-screen interactive gallery
- 📍 **Neighborhood Guides** — Dedicated SEO landing pages for Kiyovu, Nyarutarama, Gacuriro, Kibagabaga, and Kacyiru
- 📊 **Admin Dashboard** — Secure CMS to manage properties, inquiries, agent applications, CRM leads, and analytics
- 📧 **Email Automation** — Automated welcome emails via [Resend](https://resend.com) with subscriber management
- 💬 **WhatsApp Integration** — Floating WhatsApp button and lead-capture modal for direct client engagement
- 🔍 **SEO Optimised** — Dynamic Open Graph images, JSON-LD structured data, XML sitemap, and canonical tags
- 📈 **Analytics** — Built-in page-view tracking dashboard

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| Auth | [NextAuth.js](https://next-auth.js.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Email | [Resend](https://resend.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Image Processing | [Sharp](https://sharp.pixelplumbing.com/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Project Structure

```
byd-properties/
├── app/                        # Next.js App Router
│   ├── page.js                 # Home page
│   ├── layout.js               # Root layout (SEO, fonts, JSON-LD)
│   ├── sitemap.js              # Dynamic XML sitemap
│   ├── properties/             # Property listings page
│   ├── neighborhoods/          # Neighborhood SEO landing pages
│   ├── about/                  # About page
│   ├── services/               # Services page
│   ├── contact/                # Contact page
│   ├── privacy-policy/         # Privacy Policy
│   ├── terms-of-use/           # Terms of Use
│   └── admin/                  # Protected admin dashboard
│       ├── page.js             # Dashboard overview
│       ├── properties/         # Property CRUD
│       ├── inquiries/          # Inquiry management
│       ├── agents/             # Agent applications
│       ├── leads/              # CRM leads
│       ├── analytics/          # Page-view analytics
│       └── content/            # Editable site content
│
├── app/api/                    # API Route Handlers
│   ├── properties/             # Property CRUD endpoints
│   ├── inquiries/              # Inquiry submission & retrieval
│   ├── agents/                 # Agent application endpoint
│   ├── subscribe/              # Newsletter subscription
│   ├── unsubscribe/            # One-click unsubscribe
│   ├── analytics/              # Page-view tracking
│   ├── crm/                    # CRM lead management
│   ├── upload/                 # Image upload handler
│   ├── og/                     # Dynamic Open Graph image generation
│   ├── content/                # Site content API
│   └── auth/                   # NextAuth authentication
│
├── components/                 # Reusable React components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── PropertyCard.jsx
│   ├── PropertyGallery.jsx     # Full-screen interactive gallery
│   ├── HomePageClient.jsx      # Animated home page sections
│   ├── ContactForm.jsx
│   ├── SubscriptionForm.jsx
│   ├── BecomeAgentModal.jsx
│   ├── WhatsAppButton.jsx
│   ├── WhatsAppLeadModal.jsx
│   ├── PageViewTracker.jsx
│   ├── AnimatedSection.jsx
│   └── admin/                  # Admin-specific components
│       ├── Sidebar.jsx
│       └── PropertyForm.jsx
│
├── lib/                        # Shared utilities
│   ├── db.js                   # Supabase query helpers
│   ├── supabase.js             # Supabase client initialisation
│   └── neighborhoods.js        # Neighborhood metadata
│
├── public/                     # Static assets
├── middleware.js               # Route protection for /admin
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later — [Download](https://nodejs.org/en/download/)
- A **Supabase** project — [Create one free](https://supabase.com/)
- A **Resend** account for email — [Sign up](https://resend.com/)

### 1. Clone the repository

```bash
git clone https://github.com/reneineza/BYD-Properties-Ltd.git
cd BYD-Properties-Ltd
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string

# Admin credentials
ADMIN_EMAIL=admin@bydproperties.com
ADMIN_PASSWORD=your-secure-password

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (email)
RESEND_API_KEY=re_your_api_key
```

> ⚠️ Never commit `.env.local` to version control. It is already listed in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Dashboard

Access the protected admin panel at `/admin`.

| Section | URL | Description |
|---|---|---|
| Overview | `/admin` | Stats and quick summary |
| Properties | `/admin/properties` | Add, edit, delete listings |
| Inquiries | `/admin/inquiries` | View property inquiries |
| Agent Applications | `/admin/agents` | Review agent sign-ups |
| CRM Leads | `/admin/leads` | WhatsApp lead pipeline |
| Analytics | `/admin/analytics` | Page-view traffic data |
| Site Content | `/admin/content` | Edit contact info & text |

Authentication is handled by **NextAuth.js** with credential-based login. All `/admin` routes are protected by `middleware.js`.

---

## Deployment

The site is deployed on **Vercel** with automatic deployments on every push to `main`.

```bash
# Build for production locally
npm run build
npm start
```

### Required Vercel Environment Variables

Add all variables from your `.env.local` to your Vercel project settings under **Settings → Environment Variables**.

---

## SEO Features

- ✅ Dynamic `<title>` and `<meta description>` per page
- ✅ Open Graph & Twitter Card tags with dynamic OG image generation (`/api/og`)
- ✅ JSON-LD structured data (`RealEstateAgent` schema)
- ✅ XML sitemap at `/sitemap.xml` (auto-generated from Supabase data)
- ✅ Canonical URLs
- ✅ Neighborhood-specific landing pages for local SEO

---

## Email Features

Subscriber emails are powered by **Resend** using the verified domain `bydproperties.rw`.

- Welcome email on newsletter subscription
- Branded email template with logo and Lucide icons
- One-click unsubscribe link (`/api/unsubscribe`)
- GDPR-compliant unsubscribe workflow

---

## License

This is a private commercial project. All rights reserved © BYD Properties Ltd.

---

## Contact

**BYD Properties Ltd.**  
Kigali, Rwanda  
📞 +250 788 661 932  
📧 info@bydproperties.rw  
🌐 [www.bydproperties.rw](https://www.bydproperties.rw)
