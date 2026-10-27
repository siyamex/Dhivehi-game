# BasHoadha (ބަސްހޯދާ) — Dhivehi Word Puzzle Game

BasHoadha is an interactive Dhivehi (Thaana script) word search puzzle game featuring deterministic daily competitive challenges, an offline campaign mode with Progressive Web App (PWA) support, rich RTL syllable-cluster rendering, personal progress tracking, and a server-synced global leaderboard.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following core product and architectural decisions incorporate your confirmed preferences from our initial design alignment:

- **Confirmed Decision 1 — Thaana Word Search Grid Mechanic**: Inspired directly by your reference image (`/public/assets/aistudio/image_a22d7c16.png`), each grid tile holds a complete **Thaana syllable unit (Akuru + Fili)** such as `ރި`, `ބަ`, `ރު`, `ޖު`, `ސަ`. Players drag or tap across horizontally (right-to-left), vertically, or diagonally connected tiles to discover hidden Dhivehi words listed in the **"ހޯދަންވީ ބަސްތައް" (Words to Find)** panel.
- **Confirmed Decision 2 — Local Offline Storage + Server-Synced Global Leaderboard**: All campaign levels, daily puzzle seeds, user statistics, and streaks are stored locally for 100% offline playability (backed by a PWA service worker). Completed daily and campaign scores are queued locally when offline and automatically synchronized to the backend global leaderboard when internet connectivity is available.
- **Confirmed Decision 3 — Clean Modern Maldivian Coral & Lagoon Minimal UI**: A refined 60-30-10 coastal palette pairing a crisp coral-sand neutral canvas with raised white tactile letter tiles, lagoon turquoise active word highlights, and warm coral-red found-word locking.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a full-viewport game shell where players solve Dhivehi word search grids across two core modes:
  1. **Daily Challenge (`ދުވަހުގެ ގޮންޖެހުން`)**: A date-seeded board identical for every player worldwide each day, timed and scored for competitive leaderboard ranking.
  2. **Offline Category Packs (`އޮފްލައިން ލެވެލްތައް`)**: Multi-level themed packs (Maldivian Atolls & Islands, Marine & Reef Life, Dhivehi Culture & Heritage, Everyday Vocabulary, and Nature & Weather) playable anytime without an internet connection.
- **Target Audience / Persona**: Dhivehi speakers, students, language learners, and competitive puzzle fans looking for a culturally authentic, typographically accurate Thaana word game.
- **Key Value**: Solves the common problem of broken RTL diacritic rendering in grid games by treating each **Thaana consonant + vowel diacritic (`Akuru + Fili`)** as an atomic grid cell, paired with optional English glosses and pronunciation hints for learners.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Atmospheric Title Screen (`TITLE_MENU`)**:
   - Full-viewport game shell featuring a bespoke inline `<svg>` title lockup (**ބަސްހޯދާ · BasHoadha**) with animated floating Thaana syllable tiles in the background over generous negative space.
   - Displays player call-sign/profile selector, current daily streak readout (`tabular-nums`), offline/online status badge, PWA install prompt button, and primary CTAs for **Start Daily Puzzle** (`Enter` / `Space`) and **Offline Campaign Packs**.
   - Single flat control-hint line at the base: `Drag or Click Tiles to Connect · H Hint · Space Start · Esc Pause`.
2. **Active Play View (`PLAYING`)**:
   - **Perimeter HUD Header**: Compact, low-occlusion top bar displaying Mode/Level title, elapsed timer (`tabular-nums`), current score & combo multiplier, 4-Tier Hint trigger, Audio Mute toggle, and Pause button.
   - **Interactive Thaana Grid (Centerpiece)**: 8×8 (Standard) or 10×10 (Master) tactile board where each cell is at least `48px × 48px` with high-contrast Thaana typography (`dir="rtl"`). Dragging across cells renders a smooth SVG capsule beam and displays a live RTL syllable assembly preview above the board.
   - **Words to Find Panel (`ހޯދަންވީ ބަސްތައް`)**: Positioned alongside the grid on desktop (and neatly below on mobile), showing all target Dhivehi words in authentic RTL script. Players can toggle English meanings/transliterations, and discovered words animate with a strikethrough and color badge matching their highlight on the board.
3. **4-Tier Assist & Hint System**:
   - **Tier 1**: Highlights the starting syllable tile (`ފުރަތަމަ އަކުރު`) of an unfound word.
   - **Tier 2**: Reveals the directional orientation (e.g., Right-to-Left Horizontal, Downward Vertical, Diagonal) of the target word.
   - **Tier 3**: Highlights the row or column containing the word's start.
   - **Tier 4**: Briefly pulses the full word path on the board.
4. **Victory, Progress & Leaderboard Modals (`ROUND_SUMMARY` / `LEADERBOARD` / `STATS`)**:
   - **Round Summary Modal**: Celebrates puzzle completion with Web Audio chime synthesis, particle burst, time bonus calculation, accuracy breakdown, and instant **Next Level** or **Share Daily Result** actions.
   - **Competitive Leaderboard**: Filterable between **Today's Daily Challenge**, **All-Time High Scores**, and **Longest Streaks**, showing rank, player name, island/atoll tag, solve time (`tabular-nums`), and score, plus a manual/auto sync indicator for offline queued scores.
   - **Progress & Mastery Tracker**: Visualizes games played, words discovered, fastest solve time, daily streak calendar, and category completion percentages over time.

### Visual Identity & Theme

- **Aesthetic Direction**: Clean Modern Maldivian Coral & Lagoon Minimal UI — tactile, sunlit, and effortless to read.
- **Color Palette & Mood (60-30-10 Discipline)**:
  - **60% Dominant Neutral Canvas**: Crisp Coral Alabaster (`#F4F7F6`) in light mode / Deep Atoll Night (`#0B151C`) in dark mode.
  - **30% Structural Surfaces & Tiles**: Elevated Lagoon Mist board container (`#E2ECE9` / `#132530`) housing crisp Pure White tactile letter tiles (`#FFFFFF` / `#1B3240`) with subtle bottom keycap borders (`#CBD5E1`) and deep charcoal Thaana ink (`#0F172A` / `#F8FAFC`).
  - **10% Focal Accents & Semantic Highlights**:
    - Primary Lagoon Teal (`#0D9488`) for active drag selection and primary CTAs.
    - Coral Crimson (`#E11D48`), Emerald Reef (`#10B981`), Amber Sun (`#D97706`), Royal Ocean (`#2563EB`), and Violet Shell (`#7C3AED`) for locked-in discovered word paths on the grid.
- **Typography & Hierarchy**:
  - **Dhivehi Script (RTL)**: `Noto Sans Thaana`, `MV Waheed`, and `MV Faseyha` with `dir="rtl"` and generous line-height so upper/lower fili (`ަ`, `ި`, `ީ`, `ު`, `ޫ`, `ެ`, `ޭ`, `ޮ`, `ޯ`, `ް`) never clip.
  - **UI & Latin Headings**: `Plus Jakarta Sans` (SemiBold/Bold).
  - **Timers, Scores & Leaderboards**: `JetBrains Mono` with `font-variant-numeric: tabular-nums`.
- **Interactive Feedback & Motion**:
  - Compositor-only (`transform`, `opacity`) tile scale pops (`<= 150ms`) when hovering or dragging across syllables.
  - Procedural Web Audio API synthesizer providing tactile wooden/marimba tile ticks on selection, ascending harmonic chords when a valid Dhivehi word locks in, and a gentle low thud when releasing an invalid selection.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Atomic Syllable (`Akuru + Fili`) Grid Cells**:
  - *Chosen Approach*: Segment Dhivehi words into grapheme clusters where each base consonant (`ހ` through `ޱ`) and its attached vowel diacritic (`ފިލި`) occupy a single cell together, matching traditional Maldivian word puzzles and your reference screenshot.
  - *Why*: Standard character-splitting separates Unicode vowel marks (`U+07A6`–`U+07B0`) from their base letters (`U+0780`–`U+07A5`), resulting in孤立 dotted-circle diacritics that are unreadable in Thaana.
  - *Alternatives Considered*: Raw code-point cells (rejected because diacritics cannot stand alone in Dhivehi).
- **Decision 2 — Deterministic Seeded Daily Generator + Offline Sync Queue**:
  - *Chosen Approach*: Use a deterministic PRNG (`mulberry32` seeded by `YYYY-MM-DD`) on both client and server so the Daily Challenge works 100% offline while producing the exact same board for all competitive players on that date.
  - *Why*: Guarantees fair competition on the global leaderboard even if a player starts the daily puzzle while offline on a boat or flight and syncs their score later.
  - *Alternatives Considered*: Server-only daily board generation (rejected because it breaks offline access to the daily challenge).

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        BasHoadha Full-Viewport Shell                      │
│  ┌─────────────────┐  ┌─────────────────────────┐  ┌───────────────────┐  │
│  │   Title Screen  │  │    Active Play View     │  │ Modals & Drawers  │  │
│  │  - SVG Lockup   │  │  - Perimeter HUD Bar    │  │ - Victory Summary │  │
│  │  - Mode Select  │  │  - Thaana Grid Canvas   │  │ - Global/Daily LB │  │
│  │  - Player Setup │  │  - RTL Drag Beam Overlay│  │ - Progress Stats  │  │
│  │  - PWA Install  │  │  - Words To Find Panel  │  │ - Pause / Rules   │  │
│  └────────┬────────┘  └────────────┬────────────┘  └─────────┬─────────┘  │
└───────────┼────────────────────────┼─────────────────────────┼────────────┘
            │                        │                         │
            ▼                        ▼                         ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     Core Game & Language Engine (Client)                  │
│  ┌──────────────────────┐  ┌────────────────────┐  ┌───────────────────┐  │
│  │ Thaana Grapheme &    │  │ Seeded Grid & Word │  │ Web Audio Synth & │  │
│  │ RTL Cluster Parser   │  │ Placement Engine   │  │ Particle Effects  │  │
│  └──────────────────────┘  └────────────────────┘  └───────────────────┘  │
└────────────────────────────────────┬──────────────────────────────────────┘
                                     │
            ┌────────────────────────┴────────────────────────┐
            ▼                                                 ▼
┌────────────────────────────────────┐   ┌──────────────────────────────────┐
│  Local Persistence & PWA Offline   │   │  Express Backend API (server.ts) │
│  - Progress, Streaks & History     │   │  - GET /api/leaderboard          │
│  - Offline Score Sync Queue        │──▶│  - POST /api/leaderboard/submit  │
│  - Service Worker Asset Caching    │   │  - Daily & All-Time Rankings     │
└────────────────────────────────────┘   └──────────────────────────────────┘
```

### Data Model & State

- **Dhivehi Lexicon Entry**:
  - `word`: Full Dhivehi string (e.g., `ދިވެހިރާއްޖެ`, `ސަޖުރުބި`, `މަސްވެރިކަން`)
  - `syllables`: Array of atomic `Akuru + Fili` units (e.g., `['ސަ', 'ޖު', 'ރު', 'ބި']`)
  - `meaningEn`: English translation for learner tooltip
  - `transliteration`: Latin phonetic guide
  - `category`: Theme identifier (`daily`, `islands`, `ocean`, `culture`, `everyday`, `nature`)
- **Player Progress Store (`localStorage`)**:
  - Profile (`playerName`, `atollTag`), `currentStreak`, `bestStreak`, `lastDailyCompletedDate`, `completedLevels` map, `totalWordsFound`, `fastestTimeSec`, `scoreHistory` array, and `pendingSyncQueue` for offline score submissions.
- **Leaderboard Entry (Server & Local Cache)**:
  - `id`, `playerName`, `atollTag`, `mode` (`daily` | `campaign`), `dateKey` (`YYYY-MM-DD`), `score`, `timeSeconds`, `hintsUsed`, `timestamp`.

### Interactive Component & State Mapping

- **Grid Pointer / Touch Selection Handler**:
  - Tracks `startCell (row, col)` and `currentCell (row, col)` via unified Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`).
  - Snaps selection vector to the nearest valid 8-way cardinal/diagonal line (`0°`, `45°`, `90°`, `135°`, `180°`, `225°`, `270°`, `315°`).
  - Evaluates collected syllable sequence in both forward and reverse order against remaining unfound target words; locks in valid matches with distinct color channels and triggers round victory when all words are found.
- **Offline Sync & Leaderboard Controller**:
  - Listens to `window` `online`/`offline` events. Whenever connectivity returns or the Leaderboard modal opens, flushes `pendingSyncQueue` via `POST /api/leaderboard/submit` and refreshes live rankings from `GET /api/leaderboard`.
