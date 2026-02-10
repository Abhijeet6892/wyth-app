# WYTH — Early Stage Social & Relationship Product (MVP)

WYTH is an early-stage consumer social product being built to explore a specific gap in the modern relationships & intent-driven social space.

The goal of this MVP is not scale, but **learning**:
- How people express intent
- How social content + profiles can coexist
- How discovery, privacy, and commitment can be balanced

This repository represents an **active experiment**, not a finished product.

---

## Current Status

- MVP is live and deployed
- Core onboarding, feed, profiles, and settings flows exist
- No real users yet
- Product logic is still evolving
- Architecture and database are actively iterated

This phase is about validating **core product logic**, not growth.

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS

**Backend / Platform**
- Supabase (Auth, Database, Storage)
- PostgreSQL (via Supabase)

**Deployment**
- Vercel (production hosting)
- GitHub (source control)

**Development**
- Cursor (IDE)
- Local + Vercel preview environments

---

## Project Structure (High Level)

```text
app/                → Routes, pages, layouts (Next.js App Router)
components/         → Reusable UI components (FeedCard, Modals, etc.)
lib/ai/             → AI-related helpers & logic (bio polish, prompts)
utils/supabase/     → Supabase client & helpers
types/              → Shared TypeScript types
public/             → Static assets

**## Database (Supabase)**

- Authentication handled via Supabase Auth
- User profiles stored in `profiles`
- Career data stored separately in `career_data`
- Posts, feed logic, and social interactions stored in related tables

**Database schema is not frozen yet**  
SQL migrations were applied directly in Supabase during experimentation.

A proper schema and migration history will be documented next.

---

**## Important Notes**

- This project is intentionally not over-engineered
- Decisions prioritize speed, clarity, and learning
- Some logic may change or be removed as insights emerge
- This repository should be treated as an evolving product lab

---

**## Ownership & Intent**

This project is being built by a solo founder exploring:

- Consumer behavior
- Social product design
- Intent-based systems

Future collaboration or co-founder involvement will be evaluated after clarity on product direction.

---

**## Disclaimer**

This is **not production-grade software**.

Do not assume scalability, security hardening, or final architecture.
