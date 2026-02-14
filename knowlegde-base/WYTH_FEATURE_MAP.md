# WYTH – Feature to File Mapping

## Feed
File: app/page.tsx
Component: components/FeedCard.tsx
RPC: get_feed()
Tables: posts, profiles

---

## Connect
Component: FeedCard.tsx
RPC: send_connection_request
Tables: connection_requests, connections, profiles

---

## Reactions
Component: FeedCard.tsx
Table: post_reactions

---

## Notes
Component: InteractionModals.tsx
RPC: post_priority_comment
Table: notes

---

## Wallet
File: app/wallet/page.tsx
RPC: buy_coins
Table: profiles.wallet_balance
