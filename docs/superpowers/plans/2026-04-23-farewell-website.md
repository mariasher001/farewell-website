# Farewell Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page farewell tribute website for Basavaraj Kundaragi (DB Performance Team) with a dynamic message board backed by Neon Postgres, where visitors can add/edit/delete their own wish cards via UUID token ownership.

**Architecture:** Next.js 14 App Router with REST API routes (`/api/messages`) talking to Neon Postgres via the `pg` driver. The message board is a client component that fetches on load and mutates via fetch calls. Token-based ownership — a UUID is generated client-side at submission and stored in `localStorage`; it is also persisted server-side to authorize edits and deletes.

**Tech Stack:** Next.js 14 · Tailwind CSS · Framer Motion · Lucide React · Outfit + Inter (next/font/google) · Neon Postgres · `pg` driver · `uuid`

---

## File Map

```
farewell-website/
├── app/
│   ├── layout.tsx               fonts, metadata, html wrapper
│   ├── page.tsx                 assembles all section components
│   ├── globals.css              Tailwind directives only
│   └── api/
│       └── messages/
│           ├── route.ts         GET all, POST new
│           └── [id]/
│               └── route.ts    PUT update, DELETE remove (token-gated)
├── components/
│   ├── Hero.tsx                 full-viewport hero with animated gradient
│   ├── MessageBoard.tsx         client component — fetch, state, orchestration
│   ├── MessageCard.tsx          single card with inline edit/delete
│   ├── AddMessageForm.tsx       slide-down submission form
│   ├── TeamMessage.tsx          static featured team letter
│   ├── Highlights.tsx           scroll-animated timeline
│   ├── Closing.tsx              closing section with floating emoji
│   └── Footer.tsx               minimal footer
├── lib/
│   ├── db.ts                    Neon pg Pool singleton
│   └── types.ts                 shared TypeScript interfaces
├── scripts/
│   └── seed.sql                 CREATE TABLE + seed example card
├── __tests__/
│   └── api/
│       └── ownership.test.ts   token mismatch → 403 tests
├── .env.local                   DATABASE_URL (never committed)
├── tailwind.config.ts           font-family extensions
└── jest.config.ts               ts-jest, node env, path aliases
```

---

## Task 1: Scaffold Next.js project and install dependencies

**Files:**
- Create: all Next.js scaffold files
- Create: `.env.local`
- Create: `jest.config.ts`

- [ ] **Step 1: Scaffold the project (run in the project directory)**

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Accept all defaults. When asked about the `src/` directory, choose **No**.

Expected: project created with `app/`, `components/` (if offered), `tailwind.config.ts`, `tsconfig.json`, `package.json`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install framer-motion lucide-react pg uuid
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D @types/pg @types/uuid jest jest-environment-node @types/jest ts-jest
```

- [ ] **Step 4: Create `.env.local` with the database URL**

```
DATABASE_URL=postgresql://neondb_owner:npg_cXviJq93haNW@ep-withered-union-amml88uo.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
```

- [ ] **Step 5: Create `jest.config.ts`**

```typescript
import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
}

export default config
```

- [ ] **Step 6: Add test script to `package.json`**

Open `package.json` and add to `"scripts"`:
```json
"test": "jest"
```

- [ ] **Step 7: Verify scaffold runs**

```bash
npm run dev
```

Expected: server starts on `http://localhost:3000` with the default Next.js page. Stop with Ctrl+C.

- [ ] **Step 8: Commit**

```bash
git init
git add package.json package-lock.json tsconfig.json jest.config.ts next.config.mjs .eslintrc.json
git commit -m "feat: scaffold Next.js 14 project with dependencies"
```

---

## Task 2: Configure Tailwind fonts and layout

**Files:**
- Modify: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update `tailwind.config.ts` to register font variables**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Replace `app/globals.css` with Tailwind directives only**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Write `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Outfit, Inter } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Farewell, Basavaraj 🌟',
  description: 'A farewell tribute from the DB Performance Team · 29 April 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} scroll-smooth`}>
      <body className="bg-white antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify fonts load (start dev and open browser)**

```bash
npm run dev
```

Open `http://localhost:3000`. No errors in console. Stop with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat: configure Outfit + Inter fonts and Tailwind"
```

---

## Task 3: Database setup

**Files:**
- Create: `lib/db.ts`
- Create: `lib/types.ts`
- Create: `scripts/seed.sql`

- [ ] **Step 1: Create `lib/db.ts`**

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
})

export default pool
```

- [ ] **Step 2: Create `lib/types.ts`**

```typescript
export interface Message {
  id: string
  name: string
  message: string
  created_at: string
}
```

- [ ] **Step 3: Create `scripts/seed.sql`**

```sql
CREATE TABLE IF NOT EXISTS messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  token      UUID        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO messages (name, message, token)
VALUES (
  'The DB PERF Family',
  'Some people leave a job. You''re leaving a hole in the heart of this team. From the very first day you walked into DB PERF, you changed the energy in the room. You turned debugging sessions into learning moments. You made Mondays feel like catching up with friends. You brought warmth to every standup, every incident, every late-night fix. This isn''t goodbye. It''s just — see you around, legend. 💙',
  '00000000-0000-0000-0000-000000000000'
);
```

- [ ] **Step 4: Run the seed against Neon**

**Option A — if `psql` is available:**
```bash
psql "$DATABASE_URL" -f scripts/seed.sql
```

**Option B — Neon Console SQL Editor:**
Copy the contents of `scripts/seed.sql` and paste into the Neon Console SQL Editor at https://console.neon.tech. Run it.

Expected output: `CREATE TABLE` then `INSERT 0 1`.

- [ ] **Step 5: Verify the table and seed row exist**

In the Neon Console SQL Editor run:
```sql
SELECT id, name, LEFT(message, 40) AS preview, token FROM messages;
```

Expected: 1 row with token `00000000-0000-0000-0000-000000000000`.

- [ ] **Step 6: Commit**

```bash
git add lib/db.ts lib/types.ts scripts/seed.sql
git commit -m "feat: add Neon pg client, types, and DB seed"
```

---

## Task 4: API route — GET all messages and POST new message

**Files:**
- Create: `app/api/messages/route.ts`

- [ ] **Step 1: Write `app/api/messages/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, message, created_at FROM messages ORDER BY created_at DESC'
    )
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, message, token } = body

    if (!name?.trim() || !message?.trim() || !token) {
      return NextResponse.json(
        { error: 'name, message, and token are required' },
        { status: 400 }
      )
    }
    if (message.trim().length > 280) {
      return NextResponse.json(
        { error: 'message must be 280 characters or less' },
        { status: 400 }
      )
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (name, message, token)
       VALUES ($1, $2, $3)
       RETURNING id, name, message, token, created_at`,
      [name.trim(), message.trim(), token]
    )
    return NextResponse.json(rows[0], { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Manually test GET returns the seeded row**

```bash
npm run dev
```

In a new terminal:
```bash
curl http://localhost:3000/api/messages
```

Expected: JSON array with 1 item (the seeded card). The `token` field must NOT be present in the response. Stop dev server.

- [ ] **Step 3: Manually test POST creates a message**

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","message":"Hello!","token":"test-token-abc"}'
```

Expected: `201` response with `id`, `name`, `message`, `token`, `created_at` fields.

- [ ] **Step 4: Commit**

```bash
git add app/api/messages/route.ts
git commit -m "feat: add GET and POST /api/messages"
```

---

## Task 5: API route — PUT and DELETE with token ownership + tests

**Files:**
- Create: `app/api/messages/[id]/route.ts`
- Create: `__tests__/api/ownership.test.ts`

- [ ] **Step 1: Write failing tests for token ownership**

Create `__tests__/api/ownership.test.ts`:

```typescript
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}))

import pool from '@/lib/db'
import { PUT, DELETE } from '@/app/api/messages/[id]/route'

const mockQuery = pool.query as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('PUT /api/messages/[id]', () => {
  it('returns 403 when token does not match stored token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ token: 'correct-token' }] })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', message: 'Hi', token: 'wrong-token' }),
    })
    const res = await PUT(req, { params: { id: 'abc' } })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })

  it('returns 404 when message does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/messages/missing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', message: 'Hi', token: 'any' }),
    })
    const res = await PUT(req, { params: { id: 'missing' } })

    expect(res.status).toBe(404)
  })

  it('updates and returns the message when token matches', async () => {
    const token = 'valid-token'
    mockQuery
      .mockResolvedValueOnce({ rows: [{ token }] })
      .mockResolvedValueOnce({
        rows: [{ id: 'abc', name: 'Alice', message: 'Updated!', created_at: '2026-04-29' }],
      })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', message: 'Updated!', token }),
    })
    const res = await PUT(req, { params: { id: 'abc' } })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBe('Updated!')
  })
})

describe('DELETE /api/messages/[id]', () => {
  it('returns 403 when token does not match stored token', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ token: 'correct-token' }] })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'wrong-token' }),
    })
    const res = await DELETE(req, { params: { id: 'abc' } })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })

  it('deletes and returns success when token matches', async () => {
    const token = 'valid-token'
    mockQuery
      .mockResolvedValueOnce({ rows: [{ token }] })
      .mockResolvedValueOnce({ rows: [] })

    const req = new Request('http://localhost/api/messages/abc', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const res = await DELETE(req, { params: { id: 'abc' } })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests and confirm they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '@/app/api/messages/[id]/route'`

- [ ] **Step 3: Write `app/api/messages/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, message, token } = body

    if (!name?.trim() || !message?.trim() || !token) {
      return NextResponse.json(
        { error: 'name, message, and token are required' },
        { status: 400 }
      )
    }
    if (message.trim().length > 280) {
      return NextResponse.json(
        { error: 'message must be 280 characters or less' },
        { status: 400 }
      )
    }

    const existing = await pool.query(
      'SELECT token FROM messages WHERE id = $1',
      [id]
    )
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    if (existing.rows[0].token !== token) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { rows } = await pool.query(
      `UPDATE messages SET name = $1, message = $2
       WHERE id = $3
       RETURNING id, name, message, created_at`,
      [name.trim(), message.trim(), id]
    )
    return NextResponse.json(rows[0])
  } catch {
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 })
    }

    const existing = await pool.query(
      'SELECT token FROM messages WHERE id = $1',
      [id]
    )
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }
    if (existing.rows[0].token !== token) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await pool.query('DELETE FROM messages WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test
```

Expected:
```
PASS __tests__/api/ownership.test.ts
  PUT /api/messages/[id]
    ✓ returns 403 when token does not match stored token
    ✓ returns 404 when message does not exist
    ✓ updates and returns the message when token matches
  DELETE /api/messages/[id]
    ✓ returns 403 when token does not match stored token
    ✓ deletes and returns success when token matches

Test Suites: 1 passed, 1 passed total
Tests:       5 passed, 5 total
```

- [ ] **Step 5: Commit**

```bash
git add app/api/messages/[id]/route.ts __tests__/api/ownership.test.ts
git commit -m "feat: add PUT + DELETE /api/messages/[id] with token ownership"
```

---

## Task 6: Hero component

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Write `components/Hero.tsx`**

```typescript
'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50" />

      {/* Floating decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { w: 80, l: '8%', t: '15%', delay: 0 },
          { w: 120, l: '22%', t: '60%', delay: 0.5 },
          { w: 60, l: '55%', t: '20%', delay: 1 },
          { w: 100, l: '70%', t: '65%', delay: 1.5 },
          { w: 70, l: '85%', t: '30%', delay: 2 },
        ].map((blob, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: blob.w,
              height: blob.w,
              left: blob.l,
              top: blob.t,
              background:
                'radial-gradient(circle, rgba(251,113,133,0.25), rgba(251,191,36,0.15))',
            }}
            animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: blob.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.p
          className="text-sm font-semibold text-rose-400 uppercase tracking-widest mb-4 font-inter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          DB Performance Team · 29 April 2026
        </motion.p>

        <h1 className="font-outfit text-5xl md:text-7xl font-extrabold text-slate-800 mb-6 leading-tight">
          Farewell,{' '}
          <span className="text-rose-400">Basavaraj</span>{' '}
          <span>🌟</span>
        </h1>

        <p className="font-inter text-lg md:text-xl text-slate-500 mb-12 leading-relaxed">
          You didn't just work with us — you made us better. Thank you for everything.
        </p>

        <motion.a
          href="#messages"
          className="inline-flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-white font-inter font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-rose-200 transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Heart size={18} />
          Read Messages
        </motion.a>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Add a minimal placeholder `app/page.tsx` to verify**

```typescript
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <main>
      <Hero />
    </main>
  )
}
```

- [ ] **Step 3: Start dev server and verify Hero renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Full-viewport section with gradient background
- Floating blobs animating gently
- Headline "Farewell, Basavaraj 🌟" in large Outfit font
- "Read Messages" button visible
- No console errors

Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx app/page.tsx
git commit -m "feat: add Hero section"
```

---

## Task 7: MessageCard component

**Files:**
- Create: `components/MessageCard.tsx`

- [ ] **Step 1: Write `components/MessageCard.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { Message } from '@/lib/types'

interface Props {
  message: Message
  isOwned: boolean
  onUpdate: (id: string, name: string, message: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const AVATAR_COLORS = [
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600',
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',
]

function getAvatarColor(name: string): string {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function MessageCard({ message, isOwned, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [editName, setEditName] = useState(message.name)
  const [editMessage, setEditMessage] = useState(message.message)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!editName.trim() || !editMessage.trim()) return
    setIsSaving(true)
    await onUpdate(message.id, editName.trim(), editMessage.trim())
    setIsEditing(false)
    setIsSaving(false)
  }

  function handleCancelEdit() {
    setEditName(message.name)
    setEditMessage(message.message)
    setIsEditing(false)
  }

  const avatarColor = getAvatarColor(message.name)
  const initials = getInitials(message.name)

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 relative h-full"
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(251,113,133,0.15)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Owned card controls */}
      {isOwned && !isEditing && !isConfirmingDelete && (
        <div className="absolute top-4 right-4 flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            aria-label="Edit message"
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setIsConfirmingDelete(true)}
            aria-label="Delete message"
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {isConfirmingDelete && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white border border-rose-100 rounded-xl px-3 py-1.5 shadow-md z-10">
          <span className="text-xs text-slate-500">Delete?</span>
          <button
            onClick={() => onDelete(message.id)}
            aria-label="Confirm delete"
            className="text-xs font-semibold text-red-400 hover:text-red-500"
          >
            Yes
          </button>
          <button
            onClick={() => setIsConfirmingDelete(false)}
            aria-label="Cancel delete"
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            No
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-outfit font-bold text-sm flex-shrink-0 ring-2 ring-white shadow-sm ${avatarColor}`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm font-semibold text-slate-700 border border-rose-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Your name"
              />
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                maxLength={280}
                rows={4}
                className="w-full text-sm text-slate-600 border border-rose-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Your message"
              />
              <p className="text-xs text-slate-400 text-right">{editMessage.length}/280</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-inter"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-xs font-semibold text-white bg-rose-400 hover:bg-rose-500 px-3 py-1.5 rounded-lg disabled:opacity-50 font-inter"
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-outfit font-semibold text-slate-700 text-sm mb-1.5 pr-14">
                {message.name}
              </p>
              <p className="font-inter text-slate-500 text-sm leading-relaxed">
                {message.message}
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MessageCard.tsx
git commit -m "feat: add MessageCard with inline edit and delete confirmation"
```

---

## Task 8: AddMessageForm component

**Files:**
- Create: `components/AddMessageForm.tsx`

- [ ] **Step 1: Write `components/AddMessageForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import type { Message } from '@/lib/types'

interface Props {
  onAdd: (message: Message, token: string) => void
  onCancel: () => void
}

export default function AddMessageForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !messageText.trim()) return
    setIsSubmitting(true)
    setError('')

    const token = uuidv4()

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: messageText.trim(), token }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }

      const created = await res.json()
      onAdd(
        {
          id: created.id,
          name: created.name,
          message: created.message,
          created_at: created.created_at,
        },
        created.token
      )
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 mb-8">
        <h3 className="font-outfit font-bold text-slate-700 text-lg mb-5">
          Leave your wishes 💙
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-inter">
              Your Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Priya S."
              className="w-full border border-rose-100 rounded-xl px-4 py-3 text-sm text-slate-700 font-inter focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-300"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide font-inter">
                Your Message
              </label>
              <span className="text-xs text-slate-400 font-inter">
                {messageText.length}/280
              </span>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
              maxLength={280}
              rows={4}
              placeholder="Share a memory, a thank you, or your best wishes…"
              className="w-full border border-rose-100 rounded-xl px-4 py-3 text-sm text-slate-600 font-inter resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-300"
            />
          </div>

          {error && <p className="text-sm text-red-400 font-inter">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-rose-100 text-slate-500 font-inter font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !messageText.trim()}
              className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-inter font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Sending…' : 'Send wishes 💙'}
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/AddMessageForm.tsx
git commit -m "feat: add AddMessageForm with validation and token generation"
```

---

## Task 9: MessageBoard component

**Files:**
- Create: `components/MessageBoard.tsx`

- [ ] **Step 1: Write `components/MessageBoard.tsx`**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import MessageCard from './MessageCard'
import AddMessageForm from './AddMessageForm'
import type { Message } from '@/lib/types'

const TOKENS_KEY = 'farewell_tokens'

function getStoredTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveToken(id: string, token: string): void {
  const tokens = getStoredTokens()
  tokens[id] = token
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

function removeToken(id: string): void {
  const tokens = getStoredTokens()
  delete tokens[id]
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export default function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    setTokens(getStoredTokens())
  }, [])

  async function fetchMessages() {
    try {
      const res = await fetch('/api/messages')
      const data: Message[] = await res.json()
      setMessages(data)
    } finally {
      setIsLoading(false)
    }
  }

  function handleAdd(message: Message, token: string) {
    saveToken(message.id, token)
    setTokens((prev) => ({ ...prev, [message.id]: token }))
    setMessages((prev) => [message, ...prev])
    setShowForm(false)
  }

  async function handleUpdate(id: string, name: string, message: string) {
    const token = tokens[id]
    if (!token) return
    const res = await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message, token }),
    })
    if (res.ok) {
      const updated: Message = await res.json()
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
    }
  }

  async function handleDelete(id: string) {
    const token = tokens[id]
    if (!token) return
    const res = await fetch(`/api/messages/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (res.ok) {
      removeToken(id)
      setTokens((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }
  }

  return (
    <section id="messages" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            Wishes from the team
          </h2>
          <p className="font-inter text-slate-500">
            Everyone has something to say — leave yours below
          </p>
        </div>

        {/* Add button */}
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-white border border-rose-200 text-rose-500 font-inter font-semibold px-6 py-3 rounded-2xl shadow-sm hover:bg-rose-50 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add your wishes'}
          </motion.button>
        </div>

        {/* Slide-down form */}
        <AnimatePresence>
          {showForm && (
            <AddMessageForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading ? (
          <div role="status" className="text-center text-slate-400 py-16 font-inter">
            Loading wishes…
          </div>
        ) : (
          <>
            {/* Prompt when only the seeded card exists */}
            {messages.length <= 1 && !showForm && (
              <p className="text-center font-inter text-slate-400 text-sm mb-6">
                Be the first to leave a wish for Basavaraj →
              </p>
            )}

            {/* Card grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08 } },
                hidden: {},
              }}
            >
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                    }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <MessageCard
                      message={msg}
                      isOwned={!!tokens[msg.id]}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Update `app/page.tsx` to include MessageBoard and verify end-to-end**

```typescript
import Hero from '@/components/Hero'
import MessageBoard from '@/components/MessageBoard'

export default function Home() {
  return (
    <main>
      <Hero />
      <MessageBoard />
    </main>
  )
}
```

- [ ] **Step 3: Start dev server and test the full message flow**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
1. Seeded card ("The DB PERF Family") appears in the grid
2. "Be the first to leave a wish for Basavaraj →" prompt appears
3. Click "Add your wishes" → form slides down
4. Fill in Name + Message, submit → new card appears at top of grid
5. Edit/delete icons appear on the newly added card
6. Click pencil → card switches to inline edit mode, save works
7. Click trash → inline confirmation appears, "Yes" removes the card with animation
8. Reload the page → the card is still there (persisted in Neon)
9. Reload the page → the card you submitted still shows edit/delete (token in localStorage)
10. Open an incognito window → same card shows without edit/delete icons

Stop with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add components/MessageBoard.tsx app/page.tsx
git commit -m "feat: add MessageBoard with dynamic cards, add/edit/delete"
```

---

## Task 10: Static sections — TeamMessage, Highlights, Closing, Footer

**Files:**
- Create: `components/TeamMessage.tsx`
- Create: `components/Highlights.tsx`
- Create: `components/Closing.tsx`
- Create: `components/Footer.tsx`

- [ ] **Step 1: Write `components/TeamMessage.tsx`**

```typescript
import { Quote } from 'lucide-react'

export default function TeamMessage() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-rose-50 to-amber-50">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
            <Quote size={24} className="text-rose-400" />
          </div>
        </div>

        <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-10">
          From the team
        </h2>

        <blockquote className="font-outfit text-lg md:text-xl text-slate-600 leading-relaxed italic space-y-5">
          <p>
            "Some people leave a job. You're leaving a hole in the heart of this team.
            From the very first day you walked into DB PERF, you changed the energy in the room.
          </p>
          <p>
            You turned debugging sessions into learning moments. You made Mondays feel like
            catching up with friends. You brought warmth to every standup, every incident,
            every late-night fix.
          </p>
          <p>This isn't goodbye. It's just — see you around, legend."</p>
        </blockquote>

        <div className="mt-10 font-inter text-slate-400 text-sm">
          — With love and a little bit of tears,{' '}
          <span className="font-semibold text-rose-400">The DB PERF Family</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Write `components/Highlights.tsx`**

```typescript
'use client'

import { motion } from 'framer-motion'
import { Code2, Coffee, Heart, Star, Users, Zap } from 'lucide-react'

const highlights = [
  { Icon: Code2, text: 'Turned every debugging session into a learning moment' },
  { Icon: Coffee, text: 'Made Mondays feel like catching up with friends' },
  { Icon: Heart, text: 'Brought warmth to every standup and late-night incident' },
  { Icon: Star, text: 'Left the codebase better than you found it — always' },
  { Icon: Users, text: 'The person the team called when nothing made sense' },
  { Icon: Zap, text: 'Made performance feel personal, not just technical' },
]

export default function Highlights() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            What we'll always remember
          </h2>
          <p className="font-inter text-slate-500">A few things that made you, you</p>
        </div>

        <div className="space-y-5">
          {highlights.map(({ Icon, text }, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-rose-100 shadow-sm"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
            >
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-rose-400" />
              </div>
              <p className="font-inter text-slate-600 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Write `components/Closing.tsx`**

```typescript
'use client'

import { motion } from 'framer-motion'

const FLOATERS = [
  { emoji: '💙', left: '8%', top: '20%', delay: 0 },
  { emoji: '⭐', left: '22%', top: '65%', delay: 0.4 },
  { emoji: '✨', left: '55%', top: '18%', delay: 0.8 },
  { emoji: '💫', left: '70%', top: '70%', delay: 1.2 },
  { emoji: '🌟', left: '85%', top: '30%', delay: 1.6 },
  { emoji: '💖', left: '40%', top: '75%', delay: 2.0 },
]

export default function Closing() {
  return (
    <section className="py-28 px-6 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{ left: f.left, top: f.top }}
          animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
          transition={{
            duration: 3.5 + i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: f.delay,
          }}
        >
          {f.emoji}
        </motion.span>
      ))}

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.h2
          className="font-outfit text-4xl md:text-5xl font-extrabold text-slate-800 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Until we meet again, legend.
        </motion.h2>

        <motion.p
          className="font-inter text-lg text-slate-500 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Thank you for everything you brought to this team — the patience, the laughter,
          the late-night fixes, and the warmth. Wherever you go next, you carry a piece
          of DB PERF with you. We'll keep a chair warm.
        </motion.p>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Write `components/Footer.tsx`**

```typescript
export default function Footer() {
  return (
    <footer className="py-8 px-6 text-center border-t border-rose-50">
      <p className="font-inter text-sm text-slate-400">
        Made with ❤️ by the DB PERF Family · 2026
      </p>
    </footer>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/TeamMessage.tsx components/Highlights.tsx components/Closing.tsx components/Footer.tsx
git commit -m "feat: add TeamMessage, Highlights, Closing, and Footer sections"
```

---

## Task 11: Final page assembly

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write the final `app/page.tsx`**

```typescript
import Hero from '@/components/Hero'
import MessageBoard from '@/components/MessageBoard'
import TeamMessage from '@/components/TeamMessage'
import Highlights from '@/components/Highlights'
import Closing from '@/components/Closing'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <MessageBoard />
      <TeamMessage />
      <Highlights />
      <Closing />
      <Footer />
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble full page with all sections"
```

---

## Task 12: Full smoke test

- [ ] **Step 1: Run tests to confirm they still pass**

```bash
npm test
```

Expected: 5 tests pass, 0 failures.

- [ ] **Step 2: Start dev server and walk through every section**

```bash
npm run dev
```

Open `http://localhost:3000` and verify:

**Hero:**
- [ ] Gradient background with floating blobs animating
- [ ] "Farewell, Basavaraj 🌟" headline in large Outfit font
- [ ] "Read Messages" button present
- [ ] Clicking "Read Messages" smooth-scrolls to the message board

**Message Board:**
- [ ] Seeded "The DB PERF Family" card visible
- [ ] "Be the first to leave a wish…" prompt visible (if only 1 card)
- [ ] "Add your wishes" button opens the form with a slide animation
- [ ] Form validates: can't submit empty fields
- [ ] Character counter counts down from 280
- [ ] Submitting a message creates a card at the top of the grid
- [ ] New card has edit (pencil) and delete (trash) icons
- [ ] Edit: pencil icon switches card to inline edit mode, Save updates the card, Cancel restores it
- [ ] Delete: trash icon shows "Delete? Yes / No", Yes removes the card with animation
- [ ] Seeded card has NO edit/delete icons
- [ ] Reload: submitted cards persist, edit/delete icons still appear on your own cards
- [ ] Incognito window: same cards, but no edit/delete icons on any card

**Team Message:**
- [ ] Large italic quote block in Outfit font
- [ ] Gradient background section

**Highlights:**
- [ ] 6 highlight items with icons
- [ ] Items fade in from left as you scroll down

**Closing:**
- [ ] Floating emoji animating gently
- [ ] "Until we meet again, legend." headline
- [ ] Closing paragraph

**Footer:**
- [ ] "Made with ❤️ by the DB PERF Family · 2026"

**Responsive (resize browser or use DevTools):**
- [ ] Mobile (< 640px): single column cards
- [ ] Tablet (640–1024px): two-column cards
- [ ] Desktop (> 1024px): three-column cards

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final smoke test verified, farewell website complete"
```
