# WYTH – Master Architecture Overview

## Product Type
High-intent Social-Matrimony Hybrid Network (India-first).

Core Loop:
Discover → React → Connect → Chat → Retain

Philosophy:
- Dignity & Trust
- Scarcity-based connection (max slots)
- No swipe chaos
- Intent-driven identity

---

## Technology Stack

Frontend:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

Backend:
- Supabase (PostgreSQL)
- Supabase Auth (Email + Google OAuth)
- Supabase Storage

Security:
- RLS enabled
- RPC-driven business logic
- No frontend-enforced constraints

---

## Architectural Layers

1. Identity Layer
2. Social Graph Layer
3. Scarcity Layer
4. Content Layer
5. Reaction Layer
6. Notes Layer
7. Monetization Layer

All business rules are enforced at DB level via RPC or triggers.
