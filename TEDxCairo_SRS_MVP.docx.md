  
**TEDxCairo**  
Event Management Platform

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Software Requirements Specification (SRS)**  
**& Minimum Viable Product (MVP) Definition**

Version 1.0  |  2025

# **Table of Contents**

# **1\. Project Overview**

## **1.1 Introduction**

TEDxCairo Event Management Platform is a full-stack web application that handles the complete lifecycle of a TEDx event — from the public-facing marketing website to ticket purchasing, event-day check-in, and administrative content management.

The platform is designed to be production-ready, portfolio-worthy, and maintainable by a small team. It follows a CMS-driven architecture so all public content (speakers, sponsors, schedule, gallery) is manageable through an Admin Dashboard without touching code.

## **1.2 Objectives**

* Provide a polished public website with SEO-optimised server-side rendering

* Deliver a secure, end-to-end ticket purchase flow with real payment integration

* Generate QR-coded tickets and send them by email automatically

* Enable real-time QR scanning at event entry to validate and mark tickets as used

* Offer an Admin Dashboard as a full headless CMS for all dynamic content

* Include optional engagement features: networking, voting, gamification, live polls

## **1.3 Scope**

This document covers:

1. Public Website (6 pages, SSR/SSG)

2. Ticket System (purchase → payment → QR → email)

3. Admin Dashboard (full CMS \+ analytics)

4. Database schema, API design, folder structure, roles & permissions

5. MVP phase scope vs. future phases

## **1.4 Stakeholders**

| Role | Responsibility | Access Level |
| ----- | ----- | ----- |
| Super Admin | Full system control, can create other admins | All routes |
| Admin | Manage content, view tickets, export data | Admin Dashboard |
| Ticket Scanner | Scan QR codes at event entry door | Scanner app only |
| Attendee | Browse website, purchase tickets | Public \+ Ticket flow |
| Speaker | View their own profile page | Public only |

# **2\. MVP Scope & Phases**

## **2.1 MVP Definition**

| MVP Goal: A working platform where users can browse the event website, buy a ticket, receive it by email, and check in at the door — and admins can manage all content through a dashboard. |
| :---- |

## **2.2 Feature Phases**

| Feature | Phase 1 (MVP) | Phase 2 | Phase 3 |
| ----- | ----- | ----- | ----- |
| Public Website (6 pages) | ✅ Yes | — | — |
| Ticket Purchase Flow | ✅ Yes | — | — |
| Paymob / Stripe Payment | ✅ Yes | — | — |
| QR Code Generation | ✅ Yes | — | — |
| Email Delivery (Resend) | ✅ Yes | — | — |
| QR Scanner (door entry) | ✅ Yes | — | — |
| Admin Dashboard (CMS) | ✅ Yes | — | — |
| Ticket Analytics | ✅ Yes | — | — |
| Excel Export | ✅ Yes | — | — |
| Attendee Networking | — | ✅ Yes | — |
| Speaker Voting | — | ✅ Yes | — |
| Live Polls (WebSocket) | — | ✅ Yes | — |
| Gamification / Points | — | — | ✅ Yes |
| Event Map (interactive) | — | — | ✅ Yes |
| Mobile App (React Native) | — | — | ✅ Yes |

# **3\. Technology Stack**

## **3.1 Full Stack Overview**

| Layer | Technology | Reason |
| ----- | ----- | ----- |
| Frontend | Next.js 15 (App Router) | SSR/SSG \+ API Routes in one project |
| Styling | Tailwind CSS \+ shadcn/ui | Rapid UI, accessible components |
| Animation | Framer Motion | Hero sections, page transitions |
| State (client) | Zustand | Lightweight, no boilerplate |
| Forms | React Hook Form \+ Zod | Type-safe validation |
| Auth | NextAuth.js v5 (Auth.js) | Credentials \+ OAuth, session management |
| ORM | Drizzle ORM | Type-safe SQL, excellent DX with Next.js |
| Database | PostgreSQL (Neon or Supabase) | Relational, scalable, free tier available |
| File Upload | Cloudinary | CDN \+ image transformations |
| Email | Resend \+ react-email | Transactional email, React templates |
| Payment | Paymob (Egypt) \+ Stripe (intl) | Local card \+ Vodafone Cash support |
| QR Generate | qrcode (npm) | Server-side QR PNG generation |
| QR Scan | html5-qrcode | Camera-based scanning in browser |
| Realtime (Phase 2\) | Pusher / Socket.io | Live polls, notifications |
| Deployment | Vercel | Zero-config Next.js, preview URLs |

## **3.2 Key Libraries (package.json)**

| {   "dependencies": {     "next": "^15.0.0",     "react": "^19.0.0",     "react-dom": "^19.0.0",     "next-auth": "^5.0.0",     "drizzle-orm": "^0.38.0",     "@neondatabase/serverless": "^0.10.0",     "zod": "^3.23.0",     "react-hook-form": "^7.53.0",     "@hookform/resolvers": "^3.9.0",     "tailwindcss": "^3.4.0",     "framer-motion": "^11.0.0",     "zustand": "^5.0.0",     "qrcode": "^1.5.4",     "html5-qrcode": "^2.3.8",     "resend": "^4.0.0",     "@react-email/components": "^0.0.25",     "cloudinary": "^2.5.0",     "xlsx": "^0.18.5",     "lucide-react": "^0.460.0",     "date-fns": "^4.1.0"   },   "devDependencies": {     "drizzle-kit": "^0.29.0",     "@types/qrcode": "^1.5.5",     "typescript": "^5.6.0"   } } |
| :---- |

# **4\. Folder Structure**

## **4.1 Root Structure**

| tedxcairo/ ├── app/                          \# Next.js App Router ├── components/                   \# Shared UI components ├── lib/                          \# Utilities, configs, helpers ├── db/                           \# Drizzle schema \+ migrations ├── emails/                       \# react-email templates ├── public/                       \# Static assets ├── hooks/                        \# Custom React hooks ├── stores/                       \# Zustand stores ├── types/                        \# TypeScript types & interfaces ├── middleware.ts                 \# NextAuth route protection ├── auth.ts                       \# NextAuth config ├── drizzle.config.ts             \# Drizzle kit config ├── next.config.ts └── tailwind.config.ts |
| :---- |

## **4.2 App Router (Route Groups)**

| app/ ├── layout.tsx                    \# Root layout ├── globals.css │ ├── (public)/                     \# Public website (no auth required) │   ├── layout.tsx                \# Navbar \+ Footer │   ├── page.tsx                  \# Home │   ├── about/page.tsx │   ├── speakers/page.tsx │   ├── sponsors/page.tsx │   ├── schedule/page.tsx │   ├── gallery/page.tsx │   └── contact/page.tsx │ ├── (tickets)/                    \# Ticket purchase flow │   ├── layout.tsx                \# Minimal layout (no nav) │   ├── tickets/ │   │   ├── page.tsx              \# Choose ticket type │   │   ├── checkout/page.tsx     \# Enter details \+ pay │   │   └── success/page.tsx      \# Confirmation \+ QR preview │   └── tickets/\[id\]/page.tsx     \# View single ticket │ ├── (admin)/                      \# Admin Dashboard (protected) │   ├── layout.tsx                \# Admin sidebar layout │   ├── admin/ │   │   ├── page.tsx              \# Dashboard overview │   │   ├── tickets/ │   │   │   ├── page.tsx          \# Ticket list \+ stats │   │   │   └── \[id\]/page.tsx     \# Single ticket detail │   │   ├── speakers/ │   │   │   ├── page.tsx          \# Speakers list │   │   │   ├── new/page.tsx │   │   │   └── \[id\]/edit/page.tsx │   │   ├── sponsors/ │   │   │   ├── page.tsx │   │   │   ├── new/page.tsx │   │   │   └── \[id\]/edit/page.tsx │   │   ├── schedule/ │   │   │   ├── page.tsx │   │   │   └── new/page.tsx │   │   ├── gallery/ │   │   │   └── page.tsx │   │   └── settings/page.tsx │   │ │   └── scanner/page.tsx          \# QR scanner (role: scanner) │ └── api/                          \# API Routes     ├── auth/\[...nextauth\]/route.ts     ├── tickets/     │   ├── route.ts              \# POST /api/tickets (create)     │   └── \[id\]/     │       ├── route.ts          \# GET single ticket     │       └── scan/route.ts     \# POST scan (mark used)     ├── payments/     │   ├── create-intent/route.ts     │   └── webhook/route.ts      \# Paymob/Stripe webhook     ├── speakers/route.ts         \# GET \+ POST     ├── speakers/\[id\]/route.ts    \# GET \+ PUT \+ DELETE     ├── sponsors/route.ts     ├── sponsors/\[id\]/route.ts     ├── schedule/route.ts     ├── schedule/\[id\]/route.ts     ├── gallery/route.ts     ├── contact/route.ts     └── admin/         ├── stats/route.ts        \# Dashboard stats         └── export/route.ts       \# Excel export |
| :---- |

## **4.3 Components Structure**

| components/ ├── ui/                           \# shadcn/ui base components │   ├── button.tsx │   ├── input.tsx │   ├── dialog.tsx │   ├── table.tsx │   └── badge.tsx │ ├── layout/ │   ├── navbar.tsx │   ├── footer.tsx │   └── admin-sidebar.tsx │ ├── public/                       \# Public website components │   ├── hero-section.tsx │   ├── speaker-card.tsx │   ├── sponsor-logo.tsx │   ├── schedule-item.tsx │   └── gallery-grid.tsx │ ├── tickets/                      \# Ticket flow components │   ├── ticket-type-card.tsx │   ├── checkout-form.tsx │   ├── payment-widget.tsx │   └── qr-ticket-display.tsx │ ├── admin/                        \# Admin components │   ├── stats-card.tsx │   ├── data-table.tsx │   ├── speaker-form.tsx │   ├── sponsor-form.tsx │   └── schedule-form.tsx │ └── scanner/     └── qr-scanner.tsx |
| :---- |

## **4.4 Lib & Config**

| lib/ ├── db/ │   └── index.ts                  \# Drizzle client (singleton) ├── auth/ │   └── config.ts                 \# NextAuth providers ├── validations/ │   ├── ticket.schema.ts │   ├── speaker.schema.ts │   └── sponsor.schema.ts ├── services/ │   ├── qr.service.ts             \# QR generation logic │   ├── email.service.ts          \# Resend helpers │   ├── payment.service.ts        \# Paymob/Stripe helpers │   └── cloudinary.service.ts ├── utils/ │   ├── format.ts │   └── cn.ts                     \# clsx \+ tailwind merge └── constants/     └── ticket-types.ts |
| :---- |

# **5\. Database Schema**

## **5.1 Entity Relationship Overview**

The database uses PostgreSQL. All schemas are defined in Drizzle ORM with full TypeScript types.

## **5.2 Schema: Users**

| // db/schema/users.ts import { pgTable, uuid, text, varchar, timestamp, pgEnum } from 'drizzle-orm/pg-core'; export const userRoleEnum \= pgEnum('user\_role', \['super\_admin', 'admin', 'scanner', 'attendee'\]); export const users \= pgTable('users', {   id:         uuid('id').primaryKey().defaultRandom(),   name:       varchar('name', { length: 255 }).notNull(),   email:      varchar('email', { length: 255 }).notNull().unique(),   password:   text('password'),                       // hashed (bcrypt)   role:       userRoleEnum('role').default('attendee').notNull(),   image:      text('image'),                          // profile picture URL   createdAt:  timestamp('created\_at').defaultNow().notNull(),   updatedAt:  timestamp('updated\_at').defaultNow().notNull(), }); export type User \= typeof users.$inferSelect; export type NewUser \= typeof users.$inferInsert; |
| :---- |

## **5.3 Schema: Tickets**

| // db/schema/tickets.ts import { pgTable, uuid, varchar, integer, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'; import { users } from './users'; export const ticketTypeEnum \= pgEnum('ticket\_type', \['regular', 'student', 'vip'\]); export const ticketStatusEnum \= pgEnum('ticket\_status', \['pending', 'active', 'used', 'cancelled'\]); export const tickets \= pgTable('tickets', {   id:             uuid('id').primaryKey().defaultRandom(),   userId:         uuid('user\_id').references(() \=\> users.id, { onDelete: 'set null' }),   // Denormalised buyer info (in case user account deleted)   buyerName:      varchar('buyer\_name', { length: 255 }).notNull(),   buyerEmail:     varchar('buyer\_email', { length: 255 }).notNull(),   type:           ticketTypeEnum('type').notNull(),   price:          integer('price').notNull(),          // in piasters (EGP cents)   qrCode:         text('qr\_code').notNull().unique(),  // encrypted UUID payload   status:         ticketStatusEnum('status').default('pending').notNull(),   scannedAt:      timestamp('scanned\_at'),             // null until used   scannedById:    uuid('scanned\_by\_id').references(() \=\> users.id),   paymentId:      uuid('payment\_id'),                  // FK to payments   emailSentAt:    timestamp('email\_sent\_at'),   createdAt:      timestamp('created\_at').defaultNow().notNull(), }); export type Ticket \= typeof tickets.$inferSelect; |
| :---- |

## **5.4 Schema: Payments**

| // db/schema/payments.ts import { pgTable, uuid, integer, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'; export const paymentProviderEnum \= pgEnum('payment\_provider', \['paymob', 'stripe'\]); export const paymentStatusEnum   \= pgEnum('payment\_status', \['pending', 'paid', 'failed', 'refunded'\]); export const payments \= pgTable('payments', {   id:           uuid('id').primaryKey().defaultRandom(),   ticketId:     uuid('ticket\_id').notNull(),   amount:       integer('amount').notNull(),            // piasters   currency:     varchar('currency', { length: 3 }).default('EGP').notNull(),   provider:     paymentProviderEnum('provider').notNull(),   providerRef:  varchar('provider\_ref', { length: 255 }),  // Paymob order ID / Stripe PI   status:       paymentStatusEnum('status').default('pending').notNull(),   metadata:     text('metadata'),                       // JSON string   createdAt:    timestamp('created\_at').defaultNow().notNull(),   updatedAt:    timestamp('updated\_at').defaultNow().notNull(), }); |
| :---- |

## **5.5 Schema: Speakers**

| // db/schema/speakers.ts import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'; export const speakers \= pgTable('speakers', {   id:           uuid('id').primaryKey().defaultRandom(),   name:         varchar('name', { length: 255 }).notNull(),   title:        varchar('title', { length: 255 }),      // e.g. 'CEO at Acme Corp'   bio:          text('bio').notNull(),   topic:        varchar('topic', { length: 255 }).notNull(),   photoUrl:     text('photo\_url').notNull(),   talkDuration: integer('talk\_duration'),               // minutes   linkedinUrl:  text('linkedin\_url'),   twitterUrl:   text('twitter\_url'),   displayOrder: integer('display\_order').default(0).notNull(),   isVisible:    boolean('is\_visible').default(true).notNull(),   createdAt:    timestamp('created\_at').defaultNow().notNull(),   updatedAt:    timestamp('updated\_at').defaultNow().notNull(), }); export type Speaker \= typeof speakers.$inferSelect; |
| :---- |

## **5.6 Schema: Sponsors**

| // db/schema/sponsors.ts import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'; export const sponsorTierEnum \= pgEnum('sponsor\_tier', \['platinum', 'gold', 'silver', 'bronze', 'media'\]); export const sponsors \= pgTable('sponsors', {   id:           uuid('id').primaryKey().defaultRandom(),   name:         varchar('name', { length: 255 }).notNull(),   logoUrl:      text('logo\_url').notNull(),   websiteUrl:   text('website\_url'),   tier:         sponsorTierEnum('tier').notNull(),   displayOrder: integer('display\_order').default(0).notNull(),   isVisible:    boolean('is\_visible').default(true).notNull(),   createdAt:    timestamp('created\_at').defaultNow().notNull(), }); |
| :---- |

## **5.7 Schema: Schedule**

| // db/schema/schedule.ts import { pgTable, uuid, varchar, text, time, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'; import { speakers } from './speakers'; export const scheduleTypeEnum \= pgEnum('schedule\_type', \['talk', 'break', 'workshop', 'panel', 'opening', 'closing'\]); export const schedule \= pgTable('schedule', {   id:           uuid('id').primaryKey().defaultRandom(),   title:        varchar('title', { length: 255 }).notNull(),   description:  text('description'),   type:         scheduleTypeEnum('type').notNull(),   speakerId:    uuid('speaker\_id').references(() \=\> speakers.id, { onDelete: 'set null' }),   startTime:    varchar('start\_time', { length: 10 }).notNull(),   // '09:00'   endTime:      varchar('end\_time', { length: 10 }).notNull(),     // '09:45'   stage:        varchar('stage', { length: 100 }),                 // 'Main Stage'   displayOrder: integer('display\_order').default(0).notNull(),   isVisible:    boolean('is\_visible').default(true).notNull(),   createdAt:    timestamp('created\_at').defaultNow().notNull(), }); |
| :---- |

## **5.8 Schema: Gallery**

| // db/schema/gallery.ts import { pgTable, uuid, text, varchar, boolean, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'; export const galleryTypeEnum \= pgEnum('gallery\_type', \['image', 'video'\]); export const gallery \= pgTable('gallery', {   id:           uuid('id').primaryKey().defaultRandom(),   type:         galleryTypeEnum('type').notNull(),   url:          text('url').notNull(),                  // Cloudinary URL   thumbnailUrl: text('thumbnail\_url'),   caption:      varchar('caption', { length: 500 }),   eventYear:    integer('event\_year'),   displayOrder: integer('display\_order').default(0).notNull(),   isVisible:    boolean('is\_visible').default(true).notNull(),   createdAt:    timestamp('created\_at').defaultNow().notNull(), }); |
| :---- |

## **5.9 Schema: Contact Messages**

| // db/schema/contacts.ts import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core'; export const contacts \= pgTable('contacts', {   id:        uuid('id').primaryKey().defaultRandom(),   name:      varchar('name', { length: 255 }).notNull(),   email:     varchar('email', { length: 255 }).notNull(),   subject:   varchar('subject', { length: 500 }),   message:   text('message').notNull(),   isRead:    boolean('is\_read').default(false).notNull(),   createdAt: timestamp('created\_at').defaultNow().notNull(), }); |
| :---- |

## **5.10 Drizzle Index File**

| // db/index.ts import { neon } from '@neondatabase/serverless'; import { drizzle } from 'drizzle-orm/neon-http'; import \* as schema from './schema'; const sql \= neon(process.env.DATABASE\_URL\!); export const db \= drizzle(sql, { schema }); // db/schema/index.ts  (re-export everything) export \* from './users'; export \* from './tickets'; export \* from './payments'; export \* from './speakers'; export \* from './sponsors'; export \* from './schedule'; export \* from './gallery'; export \* from './contacts'; |
| :---- |

# **6\. API Routes & Server Actions**

## **6.1 API Design Principles**

* All mutations use Server Actions where possible (Next.js 15\)

* Data fetching for public pages uses direct DB calls in Server Components

* REST API routes are used for: webhooks, QR scanner (external device), Excel export

* All API routes validate input with Zod before touching the database

* Auth check via getServerSession() at the top of every protected route

## **6.2 Server Actions**

| Action File | Function | Description |
| ----- | ----- | ----- |
| actions/tickets.ts | purchaseTicket(data) | Validate → create payment intent → create pending ticket |
| actions/tickets.ts | confirmTicket(paymentRef) | Called by webhook: activate ticket, generate QR, send email |
| actions/speakers.ts | createSpeaker(data) | Admin: add new speaker (with Cloudinary upload) |
| actions/speakers.ts | updateSpeaker(id, data) | Admin: edit speaker |
| actions/speakers.ts | deleteSpeaker(id) | Admin: soft delete (isVisible=false) |
| actions/speakers.ts | reorderSpeakers(ids\[\]) | Admin: drag-drop reorder |
| actions/sponsors.ts | createSponsor(data) | Admin: add sponsor |
| actions/sponsors.ts | updateSponsor(id, data) | Admin: edit sponsor |
| actions/schedule.ts | createSlot(data) | Admin: add schedule slot |
| actions/schedule.ts | updateSlot(id, data) | Admin: edit slot |
| actions/schedule.ts | reorderSlots(ids\[\]) | Admin: reorder by time |
| actions/gallery.ts | uploadMedia(formData) | Admin: upload to Cloudinary |
| actions/gallery.ts | deleteMedia(id) | Admin: remove from gallery |
| actions/contact.ts | sendMessage(data) | Public: submit contact form |
| actions/admin.ts | markMessageRead(id) | Admin: mark contact as read |

## **6.3 REST API Endpoints**

| Method | Endpoint | Auth | Description |
| ----- | ----- | ----- | ----- |
| POST | /api/payments/create-intent | None | Create Paymob/Stripe payment intent, return client secret |
| POST | /api/payments/webhook | Signature verify | Payment provider callback — confirms payment |
| GET | /api/tickets/\[id\] | Owner or Admin | Get ticket details \+ QR code |
| POST | /api/tickets/\[id\]/scan | scanner role | Mark ticket as used, record timestamp \+ scanner ID |
| GET | /api/admin/stats | admin | Dashboard stats: sold, by type, revenue, checkin count |
| GET | /api/admin/export | admin | Stream Excel file of all tickets \+ attendees |

# **7\. Authentication & Authorization**

## **7.1 NextAuth.js v5 Configuration**

| // auth.ts import NextAuth from 'next-auth'; import Credentials from 'next-auth/providers/credentials'; import { db } from '@/db'; import { users } from '@/db/schema'; import { eq } from 'drizzle-orm'; import bcrypt from 'bcryptjs'; export const { handlers, signIn, signOut, auth } \= NextAuth({   providers: \[     Credentials({       async authorize(credentials) {         const user \= await db.query.users.findFirst({           where: eq(users.email, credentials.email as string),         });         if (\!user || \!user.password) return null;         const valid \= await bcrypt.compare(credentials.password as string, user.password);         if (\!valid) return null;         return { id: user.id, name: user.name, email: user.email, role: user.role };       }     })   \],   callbacks: {     jwt({ token, user }) {       if (user) token.role \= (user as any).role;       return token;     },     session({ session, token }) {       session.user.role \= token.role as string;       return session;     }   },   pages: { signIn: '/admin/login' } }); |
| :---- |

## **7.2 Middleware (Route Protection)**

| // middleware.ts import { auth } from '@/auth'; import { NextResponse } from 'next/server'; export default auth((req) \=\> {   const { nextUrl, auth: session } \= req;   const isAdminRoute  \= nextUrl.pathname.startsWith('/admin');   const isScannerRoute \= nextUrl.pathname.startsWith('/scanner');   if (isAdminRoute && \!session) {     return NextResponse.redirect(new URL('/admin/login', req.url));   }   if (isAdminRoute && \!\['admin', 'super\_admin'\].includes(session?.user?.role ?? '')) {     return NextResponse.redirect(new URL('/unauthorized', req.url));   }   if (isScannerRoute && \!\['admin', 'super\_admin', 'scanner'\].includes(session?.user?.role ?? '')) {     return NextResponse.redirect(new URL('/admin/login', req.url));   }   return NextResponse.next(); }); export const config \= {   matcher: \['/admin/:path\*', '/scanner/:path\*', '/api/admin/:path\*'\], }; |
| :---- |

## **7.3 Role Permissions Matrix**

| Resource/Action | Public | Attendee | Scanner | Admin | Super Admin |
| ----- | ----- | ----- | ----- | ----- | ----- |
| View public website | ✅ | ✅ | ✅ | ✅ | ✅ |
| Buy ticket | ✅ | ✅ | — | — | — |
| View own ticket | — | ✅ | — | — | — |
| Scan QR at door | — | — | ✅ | ✅ | ✅ |
| View ticket list | — | — | — | ✅ | ✅ |
| Export Excel | — | — | — | ✅ | ✅ |
| Manage speakers | — | — | — | ✅ | ✅ |
| Manage sponsors | — | — | — | ✅ | ✅ |
| Manage schedule | — | — | — | ✅ | ✅ |
| Manage gallery | — | — | — | ✅ | ✅ |
| View contact msgs | — | — | — | ✅ | ✅ |
| Create admin users | — | — | — | — | ✅ |
| System settings | — | — | — | — | ✅ |

# **8\. Ticket Purchase Flow**

## **8.1 Ticket Types & Pricing**

| Type | Price (EGP) | Benefits | Capacity |
| ----- | ----- | ----- | ----- |
| Regular | 300 | Standard seating, event access | 200 |
| Student | 150 | Standard seating, requires valid student ID | 100 |
| VIP | 800 | Front row, coffee break access, speaker meetup | 50 |

## **8.2 Purchase Flow Diagram (Step by Step)**

1. User selects ticket type on /tickets page

2. User fills checkout form: Full Name, Email, Phone

3. Frontend calls Server Action: purchaseTicket(data)

4. Server Action validates with Zod, creates pending ticket in DB, calls Paymob API to get payment\_key

5. Frontend renders Paymob iFrame or redirects to Paymob hosted page

6. User completes payment on Paymob

7. Paymob sends webhook POST to /api/payments/webhook

8. Webhook verifies HMAC signature, calls confirmTicket(paymentRef)

9. confirmTicket: updates ticket status to 'active', generates QR code (PNG), sends email via Resend

10. User is redirected to /tickets/success?id=... and sees their QR code

## **8.3 QR Code Generation**

| // lib/services/qr.service.ts import QRCode from 'qrcode'; import crypto from 'crypto'; // The QR payload is a signed JWT so it can't be forged export async function generateTicketQR(ticketId: string): Promise\<string\> {   const payload \= JSON.stringify({     id: ticketId,     ts: Date.now(),     sig: crypto.createHmac('sha256', process.env.QR\_SECRET\!)               .update(ticketId).digest('hex').slice(0, 16),   });   // Returns base64 PNG data URL   return QRCode.toDataURL(payload, {     errorCorrectionLevel: 'H',     margin: 2,     width: 400,   }); } // Validate QR payload on scan export function verifyQRPayload(raw: string): { ticketId: string } | null {   try {     const { id, sig } \= JSON.parse(raw);     const expected \= crypto.createHmac('sha256', process.env.QR\_SECRET\!)                            .update(id).digest('hex').slice(0, 16);     if (sig \!== expected) return null;     return { ticketId: id };   } catch { return null; } } |
| :---- |

## **8.4 QR Scanner (Door Entry)**

| // app/(admin)/scanner/page.tsx  (role: scanner | admin) // components/scanner/qr-scanner.tsx 'use client'; import { Html5QrcodeScanner } from 'html5-qrcode'; import { useEffect, useState } from 'react'; export function QRScanner() {   const \[result, setResult\] \= useState\<'idle'|'valid'|'used'|'invalid'\>('idle');   useEffect(() \=\> {     const scanner \= new Html5QrcodeScanner('reader', { fps: 10, qrbox: 280 }, false);     scanner.render(async (decodedText) \=\> {       scanner.pause(true);       const res \= await fetch('/api/tickets/scan', {         method: 'POST',         body: JSON.stringify({ payload: decodedText }),       });       const { status } \= await res.json();       setResult(status);           // 'valid' | 'used' | 'invalid'       setTimeout(() \=\> { setResult('idle'); scanner.resume(); }, 3000);     }, console.error);     return () \=\> scanner.clear();   }, \[\]);   return (     \<div\>       \<div id='reader' /\>       {result \=== 'valid'   && \<Alert color='green'\>✅ Valid — Welcome\!\</Alert\>}       {result \=== 'used'    && \<Alert color='red'\>❌ Already scanned\!\</Alert\>}       {result \=== 'invalid' && \<Alert color='amber'\>⚠️ Invalid ticket\!\</Alert\>}     \</div\>   ); } |
| :---- |

# **9\. Public Website — Page Specifications**

## **9.1 Home Page**

| Section | Content | Implementation |
| ----- | ----- | ----- |
| Hero | Full-screen video bg, event date, CTA button 'Get Your Ticket' | Framer Motion fade-in, Next/Video |
| Event teaser | Short tagline about TEDxCairo theme | Static text \+ animation |
| Featured Speakers | 3-4 speaker cards (photo, name, topic) | Server Component, DB fetch |
| Past Events reel | Auto-playing photo strip | framer-motion horizontal scroll |
| Buy Ticket CTA | Sticky bottom bar on mobile | shadcn/ui Banner component |
| Sponsors strip | Logo row | Server Component, DB fetch |

## **9.2 Speakers Page**

* Grid of speaker cards (3 columns desktop, 2 tablet, 1 mobile)

* Each card: photo (Cloudinary optimised), name, title, topic badge

* Click → modal or drawer with full bio \+ social links

* Server Component with direct DB query — no client fetch needed

## **9.3 Schedule Page**

* Timeline layout sorted by start\_time

* Color-coded by type: talk (red), break (gray), workshop (blue)

* Each row: time slot, speaker avatar (if linked), title, stage

* 'Add to Calendar' button generates .ics file download

## **9.4 Sponsors Page**

* Grouped by tier: Platinum → Gold → Silver → Bronze → Media

* Each tier has different logo sizes (Platinum largest)

* Logo links to sponsor website (target=\_blank)

## **9.5 Gallery Page**

* Masonry grid layout using CSS columns

* Images lazy-loaded with next/image blur placeholder

* Video thumbnails with play overlay

* Lightbox on click (yet-another-react-lightbox)

* Filter tabs by year

## **9.6 Contact Page**

* Form: Name, Email, Subject, Message

* Zod validation client-side \+ server-side

* Server Action saves to contacts table \+ sends notification email to admin

* Success state shows animated checkmark

# **10\. Admin Dashboard**

## **10.1 Dashboard Overview Page**

| Stat Card | Value | Source |
| ----- | ----- | ----- |
| Total Tickets Sold | count where status='active' or 'used' | tickets table |
| Revenue (EGP) | sum of price where status='active'/'used' | tickets table |
| Checked In | count where status='used' | tickets table |
| Regular / Student / VIP | count grouped by type | tickets table |

## **10.2 Tickets Management**

* Data table with columns: Buyer, Email, Type, Status, Created At, Actions

* Filters: status, ticket type, date range

* Search by buyer name or email

* Pagination (50 per page)

* Actions: View detail, Cancel ticket, Resend email

* Export button → GET /api/admin/export → streams .xlsx file

* Stats bar above table: sold vs capacity per type

## **10.3 Speakers Management**

* Table with: Photo, Name, Topic, Order, Visible, Actions (Edit / Delete)

* Add/Edit form: all fields \+ Cloudinary image upload widget

* Drag-and-drop reorder (dnd-kit library) → calls reorderSpeakers action

* Toggle visibility without deleting

## **10.4 Sponsors Management**

* Table grouped by tier

* Add/Edit form: name, logo upload, tier selector, website URL

* Preview shows logo at correct size for its tier

## **10.5 Schedule Management**

* Timeline preview on the right, form on the left

* Form: title, type (enum), speaker select (linked to speakers table), start/end time, stage

* Drag-and-drop reorder

* Validation: end time must be after start time

## **10.6 Gallery Management**

* Grid view of all uploaded media

* Bulk upload via Cloudinary upload widget (up to 20 files)

* Edit: caption, event year, visibility

* Delete: removes from Cloudinary \+ DB

# **11\. Email System**

## **11.1 Email Templates (react-email)**

| Template | Trigger | Content |
| ----- | ----- | ----- |
| TicketConfirmation | After payment webhook confirms | QR code image, ticket type, buyer name, event details |
| TicketReminder | 24h before event (cron job) | Reminder with QR code, venue info, schedule link |
| ContactAck | After contact form submit | Auto-reply to visitor |
| AdminContactNotify | After contact form submit | Notification to admin email |

## **11.2 Ticket Email Implementation**

| // lib/services/email.service.ts import { Resend } from 'resend'; import { TicketEmail } from '@/emails/ticket-confirmation'; const resend \= new Resend(process.env.RESEND\_API\_KEY); export async function sendTicketEmail(ticket: {   buyerName: string;   buyerEmail: string;   type: string;   qrCode: string;       // base64 PNG data URL   eventDate: string; }) {   await resend.emails.send({     from: 'TEDxCairo \<tickets@tedxcairo.com\>',     to: ticket.buyerEmail,     subject: \`Your TEDxCairo Ticket — ${ticket.type.toUpperCase()}\`,     react: TicketEmail(ticket),   }); } |
| :---- |

# **12\. Environment Variables**

| \# .env.local \# Database DATABASE\_URL=postgresql://user:pass@host/tedxcairo \# NextAuth AUTH\_SECRET=\<random-32-char-string\> NEXTAUTH\_URL=http://localhost:3000 \# Paymob PAYMOB\_API\_KEY= PAYMOB\_INTEGRATION\_ID= PAYMOB\_IFRAME\_ID= PAYMOB\_HMAC\_SECRET= \# Stripe (optional / international) STRIPE\_SECRET\_KEY=sk\_live\_... STRIPE\_WEBHOOK\_SECRET=whsec\_... \# Resend RESEND\_API\_KEY=re\_... \# Cloudinary CLOUDINARY\_CLOUD\_NAME= CLOUDINARY\_API\_KEY= CLOUDINARY\_API\_SECRET= \# QR signing QR\_SECRET=\<random-32-char-string\> \# App NEXT\_PUBLIC\_APP\_URL=http://localhost:3000 ADMIN\_EMAIL=admin@tedxcairo.com |
| :---- |

# **13\. Non-Functional Requirements**

## **13.1 Performance**

* Public pages must achieve Lighthouse score ≥ 90 (Performance, SEO, Accessibility)

* All public pages use SSR/SSG — no client-side data fetching on initial load

* Images served via Cloudinary CDN with Next/Image optimization

* API response time \< 500ms for all read operations

## **13.2 Security**

* All form inputs sanitised with Zod before DB insertion

* Payment webhook endpoints verify cryptographic signatures before processing

* QR codes are signed with HMAC to prevent forgery

* Admin routes protected by middleware \+ role check on every server action

* Passwords hashed with bcrypt (cost factor 12\)

* CSRF protection via NextAuth built-in tokens

* Rate limiting on /api/payments and /api/tickets (10 req/min per IP via Vercel Edge)

## **13.3 Scalability**

* Stateless architecture — horizontally scalable on Vercel Edge

* Database connection pooling via Neon serverless driver

* File uploads to Cloudinary (never stored on server)

## **13.4 Availability**

* Target: 99.9% uptime (Vercel SLA)

* Zero-downtime deployments via Vercel preview \+ production pipeline

# **14\. Phase 2 — Advanced Features**

## **14.1 Networking System**

* Attendees create a profile after ticket purchase: name, job title, interests

* Public attendee directory visible to other ticket holders only

* 'Connect' button sends a notification and links profiles

* Requires: attendee\_profiles table, connections table, push notifications

## **14.2 Speaker Voting**

* After the event, attendees with active/used tickets can vote

* Categories: Best Speaker, Best Idea, Most Inspiring

* One vote per category per ticket

* Results visible to admin in real-time

* Requires: votes table with unique constraint (ticket\_id, category)

## **14.3 Live Polls**

* Admin creates a poll (question \+ options) from the dashboard

* Poll is pushed to all attendees' browsers via WebSocket (Pusher)

* Attendees vote from mobile — results update live

* Speaker sees live chart on their laptop

* Requires: polls table, poll\_votes table, Pusher integration

## **14.4 Gamification**

* Points awarded for: check-in (+50), attending a session (+20), voting (+10), answering a poll (+10)

* Leaderboard visible to all attendees during the event

* Top 3 win a prize — announced at closing ceremony

* Requires: user\_points table, point\_events table

# **15\. Deployment & CI/CD**

## **15.1 Infrastructure**

| Service | Provider | Plan |
| ----- | ----- | ----- |
| Next.js App | Vercel | Hobby (free) → Pro when going live |
| PostgreSQL | Neon | Free tier → Scale as needed |
| File Storage | Cloudinary | Free 25GB → Paid for production |
| Email | Resend | 100 emails/day free → Pro for events |
| Domain | Custom | e.g. tedxcairo.com (Namecheap/GoDaddy) |

## **15.2 Git Workflow**

* main branch → production (auto-deploy on Vercel)

* develop branch → staging environment on Vercel

* Feature branches → PRs → develop → main

* Branch naming: feature/ticket-system, fix/qr-scan-bug, chore/update-deps

## **15.3 Database Migrations**

| \# Generate migration from schema changes npx drizzle-kit generate \# Apply migrations to database npx drizzle-kit migrate \# Seed database (dev only) npx tsx db/seed.ts \# Drizzle Studio (visual DB browser) npx drizzle-kit studio |
| :---- |

# **16\. Implementation Roadmap**

## **16.1 Sprint Plan (6 Weeks)**

| Week | Tasks | Deliverable |
| ----- | ----- | ----- |
| Week 1 | Project setup, DB schema, auth, admin login, basic CRUD for speakers/sponsors/schedule | Working admin with content management |
| Week 2 | Public website: all 6 pages pulling from DB, responsive design, animations | Production-ready public site |
| Week 3 | Ticket flow: purchase page, Paymob integration, webhook handler, QR generation | End-to-end ticket purchase works |
| Week 4 | Email system (Resend templates), QR scanner page, ticket export (Excel) | Full ticket lifecycle complete |
| Week 5 | Admin dashboard stats, polish UI, error handling, loading states, edge cases | Production-quality admin |
| Week 6 | Performance tuning, security audit, deployment to Vercel, domain setup, testing | Live and deployed |

## **16.2 Recommended Start Order**

1. Set up repo, install dependencies, configure Drizzle \+ Neon

2. Write all DB schemas and run first migration

3. Configure NextAuth.js, create admin login page

4. Build Admin Dashboard: speakers CRUD (this tests the full stack pattern)

5. Replicate pattern for sponsors, schedule, gallery

6. Build public website (data already in DB from step 4-5)

7. Build ticket purchase flow \+ Paymob sandbox

8. Add QR generation \+ Resend email

9. Build QR scanner page

10. Add Excel export \+ dashboard stats

11. Deploy, configure domain, switch Paymob to live keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**End of Document**

TEDxCairo Platform SRS v1.0 — 2025