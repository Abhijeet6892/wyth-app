# WYTH – Database Schema

## profiles

- id (UUID, PK)
- brand_id (text, unique, auto-generated)
- full_name (text)
- intent (text)
- city_display (text)
- age (int)
- avatar_url (text)
- wallet_balance (int)
- active_slots (int)
- max_slots (int)
- ghost_mode (boolean)
- career_verified (boolean)
- relationship_status (text)
- linkedin_handle (text)
- instagram_handle (text)
- partner_preferences (jsonb)
- lifestyle (jsonb)

---

## posts

- id (uuid)
- user_id (uuid)
- caption (text)
- type (text)
- media_url (text)
- privacy_level (text)
- created_at (timestamp)

---

## post_reactions

- post_id (uuid)
- user_id (uuid)
- type (text)
Unique(post_id, user_id)

---

## notes

- post_id
- sender_id
- receiver_id
- content

---

## connections

- requester_id
- receiver_id
- status

---

## connection_requests

- requester_id
- receiver_id
- status

---

Slot enforcement:
- active_slots increments on accept
- active_slots decrements on disconnect
- Enforced by trigger check_slot_limit()
