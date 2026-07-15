# Reddit Account & CRM Task Management Portal

A high-performance, responsive React dashboard designed for managing client Reddit tasks, user assignments, submissions, and developer payouts. Built with a premium, glassmorphic dark theme, the project focuses on zero third-party routing/styling dependencies, high type safety, and fast startup performance.

---

## 🚀 Key Specifications & Tech Stack

The application has been engineered around strict requirements for speed, type safety, and clean architecture:

- **Core Library:** [React 19](https://react.dev) — Utilizing hooks, context API, and conditional routing models.
- **Type System:** [TypeScript 6.0](https://www.typescriptlang.org) — End-to-end type safety mapping all API entity schemas (Users, Tasks, Bookings, Balances) across components and services.
- **Build Tooling:** [Vite 8](https://vite.dev) — Fast, ESM-based Hot Module Replacement (HMR) for development and rollup-based bundles for production.
- **Linting:** [Oxlint 1.71](https://oxc.rs/docs/guide/usage/linter) — High-performance Rust linter configured to run rules for `react`, `typescript`, and `oxc` in sub-milliseconds.
- **Styling:** Custom Vanilla CSS — Clean separation of concerns with a consistent custom property (CSS Variable) design system.
  - Zero heavy utility CSS frameworks (like Tailwind) for optimized initial page loads.
  - Modern typography powered by the Google Fonts API (`Outfit` and `Inter`).
  - Layout built on a hybrid model of **CSS Grid** (for tabular data grids, dashboard stats panels) and **CSS Flexbox** (for alignment, header segments, action bars).
- **Design Theme:** A bespoke Glassmorphic Dark UI featuring blur backdrops (`backdrop-filter`), gradient borders, custom scrollbar tracks, and fluid transitions.

---

## 🛠️ System Architecture

### 1. Custom SPA Router (Zero-Dependency)
To avoid adding bundle weight and routing overhead, the application implements a custom lightweight single-page router leveraging the native browser **Web History API**:
- Intercepts navigation using `window.history.pushState` to update the URI path without triggering full-page server round-trips.
- Listens to browser Back/Forward actions by binding to the `popstate` event.
- Synchronizes route status with React local states inside [App.tsx](./src/App.tsx) to conditionally mount relevant page layout components.

### 2. Centralized API Client (`apiClient.ts`)
Network operations are channeled through a single modular request wrapper ([apiClient.ts](./src/services/apiClient.ts)) that enforces:
- Automatic embedding of authentication JWT tokens as `Bearer` authorization headers.
- Standardization of JSON header requests (`Content-Type: application/json`).
- **Response Interceptor:** Detects `401 Unauthorized` server response statuses (session timeouts) and triggers a centralized callback to clear browser storage keys and redirect users back to the auth page automatically.

### 3. Outbound Link Privacy Protection
To guarantee browser privacy and protect internal dashboard paths from referral leakages, all outbound hyperlinks pointing to Reddit submissions or external websites are strictly declared with:
- `rel="noreferrer"` and `target="_blank"`
This instructs client browsers to completely strip out HTTP `Referer` request headers when routing users to third-party endpoints.

---

## 📋 Features

### Standard Client Portal
- **Available Tasks Panel:** View all active client requests, filter list indices, and request details.
- **Task Booking workflow:** Book standard or private tasks. Booking a task initiates an active live countdown.
- **UseCountdown Hook (`useCountdown.ts`):** Evaluates a live `HH:MM:SS` ticking countdown based on a **60-hour** task expiration timeframe.
- **Proof Submission:** Submit Reddit reply comment URLs and optional verification notes for booked tasks.
- **Booking Cancellation:** Cancel an active booking before submission.
- **History & Earnings Dashboard:** View detailed listings of current bookings, aggregate balances (Pending vs. Paid), and status updates.

### Admin & Manager Portal (`/admin`)
- **Route Guarding:** Direct route boundary checking to prevent standard users from accessing `/admin` pages.
- **User Management (CRUD):**
  - Create new portal users (specifying Reddit handles, email IDs, initial passwords, and roles).
  - Update user profiles (PayPal addresses, Reddit profile tags, emails).
  - Modify user credentials (password resets).
  - Permanent account deletion controls.
- **Task Management (CRUD):**
  - Add new client campaigns (URLs, subreddit constraints, pricing tiers, quotas, dead-times, and types).
  - Edit or update task details.
  - Custom target assignment (bind specific tasks to specific users or leave public).
  - Delete expired campaigns.
- **Submissions Review Grid:** A central grid layout displaying proof submissions awaiting action. Admins can approve or reject (specifying review feedback notes).
- **Payout Management:** System log recorder to settle a user's pending balance once payment has been processed.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Configuration Setup
1. Copy the environment template file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and specify the API base URL of the backend service:
   ```ini
   VITE_API_BASE=https://your-backend-api.com
   ```

### Installation & Development
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the Vite local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173`.

### Production & Code Quality
- **Build Production Bundle:** Compiles TypeScript files and builds optimized distribution assets into the `/dist` directory.
  ```bash
  npm run build
  ```
- **Lint Codebase:** Runs Oxlint to check code rules.
  ```bash
  npm run lint
  ```
