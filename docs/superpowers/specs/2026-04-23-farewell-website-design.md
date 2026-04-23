# Farewell Website — Design Spec

**Date:** 2026-04-23  
**Project:** Basavaraj Kundaragi Farewell Website  
**Team:** DB Performance Team  
**Event Date:** 29 April 2026

---

## Overview

A single-page farewell tribute website for Basavaraj Kundaragi, built with Next.js 14 (App Router). Visitors can read the team's farewell message, browse and add their own wish cards, and view team highlights. Message cards are dynamic — stored in Neon Postgres and shared across all visitors in real time. Each visitor owns the cards they submit (via a UUID token in localStorage) and can edit or delete only their own.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Fonts | Outfit (headings) · Inter (body) |
| Database | Neon Postgres (`pg` driver) |
| Hosting | TBD (Vercel recommended) |

---

## Database

### Table: `messages`

```sql
CREATE TABLE messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  token      UUID        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

- `token` is a UUID generated client-side at submission time. It is stored in the submitter's `localStorage` (under key `farewell_tokens` as `{ [id]: token }`).
- The token is returned once to the creator on POST response and then stored locally. It is **not** included in GET responses, so other visitors can never see it.
- No authentication. No user accounts.

---

## API Routes

All routes live under `app/api/messages/`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/messages` | Fetch all messages ordered by `created_at DESC` |
| `POST` | `/api/messages` | Create new message. Body: `{ name, message }`. Returns `{ id, token, name, message, created_at }` |
| `PUT` | `/api/messages/[id]` | Update name/message. Body: `{ name, message, token }`. 403 if token mismatch |
| `DELETE` | `/api/messages/[id]` | Delete message. Body: `{ token }`. 403 if token mismatch |

All routes return JSON. Errors return `{ error: string }` with appropriate HTTP status codes (400 for validation, 403 for ownership mismatch, 404 for not found, 500 for DB errors).

---

## Environment Variables

```
DATABASE_URL=postgresql://... (Neon connection string, in .env.local, never committed)
```

---

## Page Structure

Single page: `app/page.tsx`. All sections are stacked vertically with smooth scroll.

### Sections (top → bottom)

1. **Hero**
2. **Message Board** (dynamic, client component)
3. **Team Message** (static featured letter)
4. **Highlights** (static timeline)
5. **Closing**
6. **Footer**

---

## Components

```
app/
  page.tsx                    ← assembles all sections
  layout.tsx                  ← font setup, metadata
  api/
    messages/
      route.ts                ← GET, POST
      [id]/
        route.ts              ← PUT, DELETE

lib/
  db.ts                       ← Neon pg client singleton (shared across API routes)

scripts/
  seed.sql                    ← one-time DB seed: creates table + inserts example card

components/
  Hero.tsx                    ← full-viewport hero
  MessageBoard.tsx            ← client component: fetches, manages state
  MessageCard.tsx             ← single card, owns edit/delete UI
  AddMessageForm.tsx          ← inline slide-down form
  TeamMessage.tsx             ← featured team letter
  Highlights.tsx              ← scroll-animated timeline
  Closing.tsx                 ← goodbye section
  Footer.tsx                  ← minimal footer
```

---

## Visual Design

### Color Palette

| Role | Value |
|------|-------|
| Page background | `slate-50` / `white` |
| Hero gradient | `rose-50` → `amber-50` → `orange-50` |
| Primary accent | `rose-400` / `rose-500` |
| Card background | `white` |
| Card hover tint | `rose-50` |
| Card border | `border-rose-100` |
| Card shadow | `shadow-rose-100` |
| Heading text | `slate-800` |
| Body text | `slate-600` |
| Meta/date text | `slate-400` |

### Typography

- **Headings:** Outfit, 700–800 weight
- **Body:** Inter, 400–500 weight
- **Featured quote:** Outfit italic, large (team message section)

### Card Design

- `rounded-2xl`, white background, `border border-rose-100`
- Soft warm shadow, lifts `translateY(-4px)` on hover with deeper shadow
- Initials avatar: auto-generated from name, colored ring
- Edit/delete: small icon buttons (pencil, trash) in top-right corner, visible only on owned cards

---

## Animations (Framer Motion)

| Element | Animation |
|---------|-----------|
| Hero content | Fade + slide up on load |
| Message cards | Staggered entrance, 0.1s delay per card |
| Add form | Smooth slide-down via `AnimatePresence` |
| Highlights items | Fade-in on scroll (`whileInView`) |
| Hero background | Slow CSS `@keyframes` gradient drift |
| Card hover | `whileHover` scale + shadow |

---

## Message Board — UX Details

### Submission Flow
1. Visitor clicks "Add your wishes" → `AddMessageForm` slides down
2. Fields: Name (required) + Message (required, max 280 chars, live counter)
3. Submit → POST → new card prepended to grid → form closes → token saved to `localStorage`
4. Edit/delete icons appear immediately on the new card

### Edit Flow
- Click pencil icon → card switches to inline edit mode (name + message become editable inputs)
- Save / Cancel buttons replace the icon controls
- Save → PUT request → card updates in place

### Delete Flow
- Click trash icon → inline confirmation appears on the card: "Delete this message? **Yes** / No"
- Yes → DELETE request → card animates out via `AnimatePresence`

### Ownership Check
- On page load, `MessageBoard` loads all messages from `GET /api/messages`
- It reads `localStorage.getItem('farewell_tokens')` and parses the `{ [id]: token }` map
- Any card whose `id` exists in the local token map gets edit/delete controls rendered

### Empty State
- The DB is seeded with 1 example card (hardcoded SQL INSERT in a `scripts/seed.sql` file, run once). This card has a sentinel token (`00000000-0000-0000-0000-000000000000`) that no real visitor will ever match, so no one sees edit/delete controls on it.
- If somehow the board has no cards beyond the seed, show a warm prompt beneath it: *"Be the first to leave a wish for Basavaraj →"*

---

## Responsive Layout

| Breakpoint | Card grid |
|------------|-----------|
| Mobile (`< sm`) | 1 column |
| Tablet (`sm–lg`) | 2 columns |
| Desktop (`> lg`) | 3 columns |

---

## Static Content

### Hero
- Headline: "Farewell, Basavaraj 🌟"
- Subtext: "From the DB Performance Team · 29 April 2026"
- CTA button: "Read Messages" (smooth scroll to message board)

### Team Message (full letter)
> "Some people leave a job. You're leaving a hole in the heart of this team. From the very first day you walked into DB PERF, you changed the energy in the room... You turned debugging sessions into learning moments. You made Mondays feel like catching up with friends. You brought warmth to every standup, every incident, every late-night fix. This isn't goodbye. It's just — see you around, legend."
>
> — With love and a little bit of tears, The DB PERF Family

### Highlights (timeline items)
- "Turned every debugging session into a learning moment"
- "Made Mondays feel like catching up with friends"
- "Brought warmth to every standup and late-night incident"
- "Left the codebase better than you found it — always"
- "The person the team called when nothing made sense"

### Closing
- Headline: "Until we meet again, legend."
- Body: "Thank you for everything you brought to this team — the patience, the laughter, the late-night fixes, and the warmth. Wherever you go next, you carry a piece of DB PERF with you. We'll keep a chair warm."
- Animated subtle floating hearts/stars (Framer Motion, gentle, not distracting)

### Footer
- "Made with ❤️ by the DB PERF Family · 2026"

---

## Accessibility

- All icon-only buttons have `aria-label`
- Color contrast meets WCAG AA
- All interactive elements keyboard-focusable
- `role="status"` on loading states

---

## Out of Scope

- Photo gallery (no real photos available)
- Authentication / admin view
- Email notifications
- Pagination (assumed <100 messages for an internal team tribute)
