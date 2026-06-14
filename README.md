# ⚡ DEBT-OPTIMISER

### Algorithmic Debt Acceleration Engine & Execution HUD | [System Access](https://debt-optimiser.vercel.app/)

**Debt-Optimiser** is a high-performance personal finance liquidation engine. It replaces passive tracking spreadsheets with an aggressive execution HUD designed to model, isolate, and crush household debt structures through real-time, math-driven projection streams.

---

## 🛡️ Core Calculation Engine & Mathematical Priority Models

The platform handles user-mutated liabilities dynamically by calculating mathematical allocation paths. It re-indexes arrays on-the-fly depending on the selected financial strategy.

### 1. Dual-Core Acceleration Sorting

* **The Avalanche Core (Mathematical Efficiency):** Automatically maps and isolates accounts carrying the highest Annual Percentage Rate (APR). By targeting this apex account first, the engine minimizes long-term compound interest loss.

$$\text{Priority} = \max(\text{APR}_i) \implies \text{Sort By: } (b.\text{interest} - a.\text{interest})$$


* **The Snowball Core (Behavioral Psychology):** Re-sorts the liability matrix to target the lowest raw balances. This prioritizes rapid account closures to build immediate behavioral momentum.

$$\text{Priority} = \min(\text{Balance}_i) \implies \text{Sort By: } (a.\text{balance} - b.\text{balance})$$



### 2. Goal-Based Payoff Simulation Engine (`PayoffPlansPage`)

The system computes predictive multi-mode amortization matrices client-side inside standard lifecycle loops (`useEffect`) to ensure zero-latency trajectory updates:

* **Target Date Mode:** Determines the explicit monthly run-rate required to collapse the entire primary balance matrix by a set month. It features built-in time-travel locks (`minMonth`) to block retroactive deadlines.
* **Target Payment Mode:** Executes a chronological month-by-month projection loop (capped at 360 months). If target payments drop below or meet the interest accrued ($Balance \times \frac{\text{Rate}}{12}$), it breaks calculation and returns a soft error block: `"Payment is too low to cover monthly interest. Your debt will grow!"`.
* **Seasonal Injection Matrix:** Accelerates principal burn by accepting custom annual lump sums (e.g., April Tax Refunds or December Corporate Bonuses) and auto-injecting them into the simulation timeline loop.
* **Trajectory Visualization:** Hydrates data maps into a Recharts `<AreaChart />` container backed by visual linear opacity gradients (`colorBalance`).

### 3. Reactive Aggregate Pipeline

The platform avoids duplicate data handling by binding an active database query stream directly into a calculation utility that maintains real-time parameters across component frames, deriving a strict mathematical weighted interest average:


$$\text{Rate}_{\text{weighted}} = \frac{\sum (\text{balance}_i \times \text{interest}_i)}{\sum \text{balance}_i}$$

---

## 🎨 Neo-Brutalist Interface Engineering

The visual interface is built with intent. Stripping away soft corporate design patterns, Debt-Optimiser utilizes deep contrast, thick asymmetric container borders, sharp edges, and high-vibrancy color tokens (`#00e5ff`, `#34d399`, `#ef4444`).

### UI Systems Overview

* **Hyper-Scannable Layouts:** Modular information blocks (`WhiteCard`, `DarkCard`) separate balance values, interest loads, and credit lines instantly.
* **Adaptive Navigation Stack:** The interface handles layout transformations cleanly. Using fluid viewport parameters, it shifts from a structural desktop navigation bar to an interactive bottom-docked mobile menu.
* **Zero-Compute Identity Tokens:** A real-time state parser tracks active auth sessions. It splits display names to extract user initials, falls back to the email prefix string if a name is missing, and reverts to standard initials (`DO`) when logged out.
* **Danger Control Lock Matrix:** Destructive database deletions are run through a local two-tier safety validation chain. Engaging a row's deletion interface changes a local contextual state (`deleteConfirmed`), bringing up a modal box. The secondary confirmation block launches an animated pulse alert panel (`animate-pulse`), requiring a targeted second click before triggering data purges.

---

## 🔄 Live Data Streaming Architecture

The frontend hooks into a serverless, highly optimized reactive backend structure built for near-zero state latency.

* **Reactive State Synchronization:** The engine rejects manual REST polling or heavy global client stores (like Redux). Instead, it establishes direct, real-time WebSocket pipelines with Cloud Firestore using the `onSnapshot` observer protocol. Any backend mutation reflects instantly across all open multi-device client sessions.
* **Decoupled Authentication Gateways:** Session verification is managed through Firebase's asynchronous `onAuthStateChanged` monitor. This is wrapped cleanly within client component lifecycles to eliminate blocking page-hydration loops.
* **State-Locked Transaction Modals:** Integrated Edit and Delete interfaces feature optimistic UI controls and submit locks (`isSubmitting`), blocking duplicate user clicks from sending redundant queries to the cloud.

---

## 💾 System Data Architecture

The application relies on clean, production-indexed data structures inside Cloud Firestore:

### User Blueprint (`users` Collection)

Manages localized preferences, strategy targets, and global financial limits.

```json
{
  "uid": "STRING (Primary Key / Document ID)",
  "monthlyBudget": 1200.00,
  "emergencyFund": 1000.00,
  "payoffStrategy": {
    "mode": "date | payment",
    "targetDate": "STRING (YYYY-MM Target Completion Bound)",
    "targetPayment": 1200.00,
    "bonusAmount": 2000.00,
    "bonusMonth": "STRING (e.g., '04' or '12')",
    "lockedAt": "STRING (ISO 8601 Timestamp)"
  }
}

```

### Liability Inventory (`debts` Collection)

Tracks individual high-precision liability objects. A composite index is enforced across `userId` and `createdAt` keys to guarantee low-latency query sorting.

```json
{
  "id": "STRING (Document ID)",
  "userId": "STRING (Foreign Key -> users.uid)",
  "name": "STRING (e.g., 'Chase Sapphire')",
  "balance": 4850.00,
  "limit": 10000.00,
  "interest": 24.99,
  "minimumPayment": 150.00,
  "dueDate": "STRING (Day of month 1-31)",
  "createdAt": "TIMESTAMP (ISO String)",
  "updatedAt": "TIMESTAMP (ISO String)"
}

```

---

## ⚡ Technical Specifications Matrix

| System Module | Technology Protocol | System Description |
| --- | --- | --- |
| **Framework Logic** | Next.js 14 / React 18 | Core engine rendering engine and hybrid layout hydration. |
| **Real-Time Data** | Cloud Firestore / WebSockets | Persistent document caching and instant data state-streaming. |
| **Security Gate** | Firebase Auth | Decoupled identity tokens and cryptographic session tracking. |
| **Data Visualization** | Recharts (Responsive SVG) | Maps amortization trajectories dynamically with `<AreaChart />` layers. |
| **Mathematical Sorting** | Heuristic Priority Sorting | Dynamic client-side array re-sorting ($b.\text{interest} - a.\text{interest}$). |
| **Layout Styling** | Tailwind CSS Utility | High-performance compiled neo-brutalist utility variables. |

---

## 📂 Application Taxonomy

```text
├── app/
│   ├── components/
│   │   ├── DarkCard.tsx          # High-contrast background framing block
│   │   ├── WhiteCard.tsx         # Foreground content container with hard shadow drop
│   │   └── ConditionalNavbar.tsx # Session-aware layout wrapper parsing Auth initials
│   ├── lib/
│   │   └── firebase.ts           # Unified SDK client initialization layer
│   ├── payoff-plans/
│   │   └── page.tsx              # Goal-based dual-mode timeline simulation & chart layout
│   ├── profile/
│   │   └── page.tsx              # User parameters and global budget overrides
│   ├── login/
│   │   └── page.tsx              # Session creation interface
│   ├── layout.tsx                # Universal app context tree structure
│   └── page.tsx                  # Core analytical dashboard layout (Debt lists & edit modal)

```

---

## 🚀 System Operation & Verification

The application is fully compiled and running live. To access, test, or review the system:

1. **Direct Cloud Access:** Visit the live deployment at [Debt Optimiser](https://debt-optimiser.vercel.app/)
2. **Local Execution Sandbox:**

```bash
git clone https://github.com/your-username/debt-optimiser.git
cd debt-optimiser
npm install
# Inject local .env parameters and start the local runtime engine
npm run dev

```

---

## 📜 Professional Standard

> "Passive tools record financial decay. Acceleration engines break it."

**Debt-Optimiser** represents a shift from passive expense tracking to systematic financial liquidation. Designed for maximum data scannability, engineered for algorithmic execution.

---

Created by a well wisher

---