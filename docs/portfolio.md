# Portfolio

Projects I've built and maintain.

---

## TableCommander

[![TableCommander](assets/img/tablecommander-logo.svg)](https://tablecommander.com)

Self-hosted multiplayer virtual tabletop for Magic: The Gathering. Build decks, create tables, and play with friends in real-time.

**Features:**

- Real-time multiplayer with WebSocket sync across players
- Interactive playmat with drag-and-drop card zones
- Deck builder with Scryfall integration and format validation
- Import decks from Moxfield, Archidekt, MTGO, Arena
- Life tracking, counters, tokens, dice rolling
- Friends system with game invites

**Stack:** Next.js, NestJS, Prisma, PostgreSQL, Redis, Socket.io

**Hosting:** GCP Cloud Run

**Tools:** Claude Code, Recraft.ai

[tablecommander.com](https://tablecommander.com)

---

## TableCommander Companion

[![TableCommander Companion](assets/img/tablecommander-companion-logo.svg)](https://play.google.com/store/apps/details?id=com.tablecommander.companion)

Android companion app for TableCommander. Interact with your game table from your phone. Currently in closed testing - join the [Discord](https://discord.gg/jfHhwpPQ) to request access.

**Features:**

- Browse, search, and build decks on the go
- Life, poison, and commander damage tracking
- In-game actions and dice rolls
- Real-time game log
- OTA updates via Firebase - no Play Store wait

**Stack:** React, Ant Design Mobile, Capacitor 8, Firebase App Distribution

**Platform:** Android (iOS planned)

**Tools:** Claude Code, Recraft.ai

[Google Play (closed testing)](https://play.google.com/store/apps/details?id=com.tablecommander.companion)

---

## Pickles Prizes

[![Pickles Prizes](assets/img/pickles-prizes-logo.svg)](https://picklesprizes.co.uk)

Charitable raffle platform supporting mountain rescue and veteran charities. 100% of profits donated.

**Features:**

- Live prize competitions with real-time ticket tracking
- Stripe checkout via headless WooCommerce
- Facebook Live stream integration for transparent draws
- Entry lists and winner history
- WordPress CMS for content management

**Stack:** Next.js, WooCommerce (headless), WordPress REST API, Stripe

**Hosting:** Cloudflare Pages & Workers

**Tools:** Claude Code

[picklesprizes.co.uk](https://picklesprizes.co.uk)
