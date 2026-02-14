# WYTH – RPC Contracts

## get_feed()

Returns:
- id
- user_id
- caption
- type
- media_url
- created_at
- full_name
- avatar_url
- age
- city_display
- is_gold
- brand_id
- intent
- career_verified
- relationship_status
- vouches_count

Respects:
- privacy_level = 'public'
- ghost_mode = false
- excludes self posts

---

## send_connection_request(receiver_uuid)

Checks:
- slot availability
- duplicate prevention

---

## accept_connection_request()

Updates:
- connection status
- increments active_slots

---

## disconnect_connection()

Decrements active_slots

---

## post_priority_comment()

Atomic:
- deduct coins
- insert note

---

## buy_coins()

Atomic wallet update
