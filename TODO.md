# Second Monitor Games — Todo List
> Created: 2026-03-01. Tackle tomorrow.

---

## 💰 Revenue & Monetization

- [ ] **Stripe — Full Integration**
  - Wire Stripe Checkout (one-time and subscription)
  - Webhook handler: `checkout.session.completed` → write to Postgres (users table, subscription status, plan)
  - Middleware: protect subscriber-only routes (archive, ad-free) based on DB subscription status
  - Customer portal link (manage/cancel subscription)
  - Handle failed payments + grace period logic

- [ ] **Google AdSense — Earn from free tier**
  - Apply for AdSense account, add site
  - Add AdSense script to layout (only for non-subscribers)
  - Place ad slots: between game cards on homepage, sidebar/banner on game pages
  - Gate ad-free experience behind subscription check
  - **Add GDPR/CCPA ad opt-out controls** — Puzzmo screenshots show a dedicated "Your Privacy Choices (Opt Out of Sale/Targeted Ads)" button in the footer. Required when running AdSense.

- [ ] **Google Ads (AdWords) — Paid acquisition**
  - Set up Google Ads account
  - Build Search campaigns targeting: "games to play at work", "free card game like Balatro browser", "daily puzzle game", "solitaire strategy game online"
  - Install Google Ads conversion tag (track subscription signups as conversions)
  - Set daily budget ($10–20/day to start), monitor CPL

- [ ] **Merchandise / Shop** *(longer term)*
  - Puzzmo has a `/shop` in their footer. Physical merch (stickers, shirts) is a low-overhead second revenue stream and doubles as brand marketing.
  - Consider: Printful/Printify integration or a simple Shopify storefront linked from footer.

---

## 🛒 Subscription & Pricing Pages

- [ ] **Rebuild Pricing / Upsell Page (`/pricing`)**
  - Free tier vs. Subscriber tier comparison table
  - Clear value props: ad-free, full archive, leaderboard access, bonus puzzles, cross-device sync
  - Price: $4.99/mo or $39.99/yr (annual saves ~33%)
  - CTA: "Start Free Trial" or "Subscribe" → Stripe Checkout
  - Social proof / "X players subscribed" counter if available

- [ ] **Subscribe Button / Subscribe Flow Page (`/subscribe`)**
  - Dedicated page that explains what you get, price, then redirects to Stripe
  - Handle: already subscribed state (show "Manage Subscription"), logged-out state (prompt sign in first)
  - Post-payment success page: confirm subscription, show what unlocked

- [ ] **Annual pricing tier** — Puzzmo charges $39.99/yr (~33% off monthly). Add yearly option to pricing page to increase LTV and reduce churn.

---

## 🎮 Game Cards Redesign

- [ ] **Game Card — Live Game State Preview in Upper Half** *(highest visual priority)*
  - Puzzmo screenshots confirm: each card renders the **actual current puzzle** as the visual (real crossword grid, real Flipart board, real Circuits puzzle). Not an illustration — the game itself.
  - SMG version:
    - Decode: render a static 6×5 tile grid with some pre-seeded colored tiles (green/yellow/grey) as a visual snapshot
    - The Escape: render a mini card layout with actual card faces/anchors from today's seed
    - Block Fall: show a frozen mid-game board state
  - Keep game name, tag, and CTA in the lower half unchanged
  - Retain "NEW" badge overlay

- [ ] **"Unplayed / Played / Completed" status badge on cards**
  - Puzzmo shows "Unplayed" in the top-right of every card
  - SMG version: read localStorage on page load, show "Unplayed" / "✓ Played" / "🔒 Completed" on each card
  - Gives players an instant dashboard view of what's left for the day

- [ ] **"Yesterday's News" / Community Moments widget**
  - Puzzmo has a one-liner at the bottom of select game cards: *"3 players completed Really Stodgy Chess without losing a piece."*
  - SMG version: surface one interesting stat from yesterday's plays per game card (e.g. "47 players escaped on their first try yesterday")
  - Requires postMessage → Postgres pipeline first

- [ ] **Bonus content badge on cards** *(subscriber feature)*
  - Puzzmo shows a "Bonus" sub-item within game cards for subscribers
  - SMG version: show a locked "Bonus puzzle" or "Archive" pill on each card for free users → upsell click

---

## 👤 User Identity & Leaderboards

- [ ] **Username / Display Name + Emoji Avatar System**
  - Puzzmo leaderboards: every user has an emoji avatar + username. Makes leaderboards feel alive and personal.
  - Let users pick a unique display name (separate from Clerk real name) + choose an emoji as their avatar
  - Store in Postgres: `users.displayName`, `users.avatar` (single emoji)
  - Show on leaderboards, profile, and shared score cards
  - Add profanity filter / reserved names list

- [ ] **Multi-dimensional Leaderboards** *(Puzzmo screenshot shows 4 panels)*
  - Today's daily score (aggregate across all games played today)
  - Today's top score per individual game
  - Best [day-of-week] score ever (e.g. "Best Sunday score all-time")
  - Best [current month] score total — drives habit to play every day all month
  - Score distribution histogram alongside each leaderboard (shows where in the bell curve your score lands)
  - Pagination on each leaderboard (← →) to see beyond top 10

- [ ] **Aggregate Daily Score across all games**
  - Puzzmo's killer retention mechanic: a combined score across all games you play that day creates a meta-game incentive to play every game, not just your favourite
  - Requires a scoring formula per game type (puzzle: based on guesses used; arcade: based on score; card: based on turns remaining)

- [ ] **Friends Leaderboard**
  - Add friends by username
  - Daily score feed comparing your results to friends
  - No need for a full social graph — just a follow list

---

## 📄 Content Pages

- [ ] **Terms of Service page (`/terms`)**
  - Standard ToS: usage rules, subscription terms, IP ownership, DMCA, governing law
  - Add effective date, contact email

- [ ] **Privacy Policy page (`/privacy`)**
  - GDPR + CCPA compliant: what data is collected, how it's used, third parties (Clerk, Stripe, AdSense), retention, user rights
  - Cookie disclosure (AdSense drops cookies)
  - CCPA opt-out section (required before running ads in CA)
  - Contact for data requests

- [ ] **Archive page (`/archive`)**
  - Calendar or date-list UI to browse past puzzles by game
  - Free users: see dates but get upsell prompt on click ("Subscribe to access the archive")
  - Subscribers: play any past puzzle directly
  - Show puzzle # for each date

- [ ] **Manifesto / Brand page** *(Puzzmo has this — it's a surprisingly effective brand + SEO page)*
  - Puzzmo has a `/manifesto` that communicates brand values and philosophy
  - SMG version: a page that articulates the "second monitor" philosophy — why quick games at work matter, what we stand for, what we're building
  - Good for: brand differentiation, backlink magnet, press mentions, AI search citations

- [ ] **Press Kit page**
  - Puzzmo has a `/press-kit`
  - Logos, screenshots, founder bio, site stats, game descriptions in a downloadable format
  - Needed when journalists / newsletter writers want to cover SMG

---

## 🔍 Competitive Gaps — from analysis vs. Puzzmo & NYT Games

> Analysis based on search research + direct Puzzmo screenshots (homepage, leaderboards, footer)

- [ ] **Cross-device sync** — Streaks/stats are localStorage only right now. Move to server-side so players keep their progress when switching devices. Requires account linkage + postMessage → Postgres pipeline.

- [ ] **Badge / Achievement system** — NYT gives badges for streaks, milestones, wins. Add a badge shelf to user profiles: "7-day streak", "First escape", "Decoded in 2 tries", etc. Low dev cost, high retention value.

- [ ] **Daily email reminder** — Both competitors drive daily habit via notifications. Build an opt-in daily reminder email ("Today's puzzles are live → play now") sent at midnight UTC. Use Resend or Postmark. Single highest-ROI retention feature.

- [ ] **Mobile experience audit** — Puzzmo and NYT have native apps + excellent mobile web. SMG is desktop-first but Decode works on mobile. Audit all three games on iOS Safari + Android Chrome; fix obvious breakage.

- [ ] **"Beat my score" share link / social loop** — After completing a game, generate a shareable challenge link. Drives virality without requiring a full social graph. ("I escaped in 12 turns — can you beat it? → link")

- [ ] **Better onboarding / first-visit flow** — Neither competitor drops users cold onto a game grid. Consider: a short animated explainer or "How to play" tooltip sequence for first-time visitors.

- [ ] **Stat history / profile page** — Puzzmo shows site-wide hours played, words found, etc. Build a `/profile` or `/stats` page that surfaces per-game stats, streaks, badges, and aggregate scores for subscribers.

- [ ] **More games (pipeline)** — Puzzmo has 11 games (visible in their footer screenshot). NYT has 10+. SMG has 3. Roadmap at least 2 new games to launch in the next 90 days. The Escape and Block Fall need to be fully up to SMG Rules v1.1 spec first.

- [ ] **Discord community** — Puzzmo links to Discord prominently. A Discord server is the highest-engagement community format for daily puzzle players. Create a server, link from footer and post-game share flow.

- [ ] **Social media presence** — Puzzmo footer shows Discord + Bluesky + Facebook + Instagram. SMG has a Twitter handle in metadata but no visible social links on the site. Add social links to footer.

---

## 🔧 Technical / Infrastructure

- [ ] **postMessage → Postgres pipeline** — Wire the Next.js iframe wrapper to listen for `GAME_OVER` postMessages and write game results to Postgres (required for leaderboards, server-side streaks, "Yesterday's News" widget, aggregate scoring)
- [ ] **Bring legacy games up to spec**
  - `the-escape.html` — bring to SMG Rules v1.1 (GAME_CONFIG, postMessage, streak, stats, how-to-play modal)
  - `block-fall.html` — same
- [ ] **game-analyzer.js** — Build validator that checks a game HTML file against SMG Rules v1.1 (Phase 3 from roadmap)

---

## 📊 Priority Order for Tomorrow

### Tier 1 — Unblock Revenue (do first)
1. **Stripe integration** — everything monetization blocks on this
2. **Pricing page rebuild** — blocked by Stripe
3. **Terms + Privacy pages** — legal requirement before running ads or charging anyone

### Tier 2 — Core Product Polish (high visual/retention impact)
4. **Game cards: live preview + Unplayed/Played status** — single biggest UX improvement, directly competitive with Puzzmo
5. **Username + emoji avatar system** — needed before leaderboards go live
6. **Archive page** — high subscriber value prop, low build effort

### Tier 3 — Growth & Retention
7. **Daily email reminder** — highest ROI retention feature per effort
8. **AdSense setup** — passive revenue, non-blocking
9. **postMessage → Postgres pipeline** — unlocks leaderboards, "Yesterday's News", cross-device sync, aggregate scoring
10. **Multi-dimensional leaderboards** — blocked by pipeline above

### Tier 4 — Brand & Community
11. **Manifesto page** — brand building + SEO
12. **Discord server** — community hub
13. **Press Kit** — PR readiness
14. **Social links in footer** — quick win
