# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Browser Environment                     │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Gmail / Outlook Web Inbox                 │  │
│  │                                                     │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Content Script (Adapter)                    │  │  │
│  │  │  - Extract sender, subject, links            │  │  │
│  │  │  - Monitor for new emails                    │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                       │                             │  │
│  │                       ▼                             │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Warning Banner (React Component)            │  │  │
│  │  │  - Display risk score & reasons              │  │  │
│  │  │  - Dismiss / Report buttons                  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                       │                                   │
│                       ▼                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │      Background Service Worker                     │  │
│  │  - Route messages from content scripts            │  │
│  │  - Run local heuristics (privacy-first)           │  │
│  │  - Handle storage (whitelists, settings)          │  │
│  │  - Optionally call backend (if opt-in)            │  │
│  └────────────────────────────────────────────────────┘  │
│                       │                                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │      Extension Storage (chrome.storage.sync)      │  │
│  │  - User preferences (cloud analysis on/off)       │  │
│  │  - Whitelist of trusted senders                   │  │
│  │  - Report count, consent status                   │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
        (Only if user opts in for cloud analysis)
                       ▼
┌─────────────────────────────────────────────────────────┐
│            Backend API (Node.js/Express)                │
│                                                           │
│  POST /api/analyze                                       │
│  - Advanced ML models (optional future)                 │
│  - DistilBERT for text analysis                         │
│  - XGBoost for URL feature extraction                   │
│                                                           │
│  POST /api/report                                        │
│  - Accept phishing reports from users                   │
│  - Store for model retraining                           │
│                                                           │
│  GET /api/stats                                          │
│  - Return anonymized statistics                         │
└─────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Content Scripts (DOM Adapters)

**Files:** `extension/src/content/gmail.tsx`, `extension/src/content/outlook.tsx`

**Responsibility:**
- Extract email metadata from DOM (sender, subject, links, etc.)
- Monitor for email open/close events
- Inject warning banner into email view
- Send/receive messages to/from background worker

**Key Functions:**
- `extractGmailEmailData()` / `extractOutlookEmailData()`
- `injectBanner()`
- `setupEmailMonitoring()`

**Design Decision:** Separate adapters for each email provider because DOM structures differ significantly. Easy to maintain and update selectors.

### 2. Background Service Worker

**File:** `extension/src/background/worker.ts`

**Responsibility:**
- Main orchestration point for the extension
- Handle message routing from content scripts
- Execute heuristic analysis
- Manage storage (sync.storage for preferences)
- Optional backend communication (if opted in)

**Key Functions:**
- `handleAnalyze()` - Route to local or cloud analysis
- `handleReport()` - Log reported emails (requires privacy consent)
- `handleWhitelist()` - Manage trusted senders
- `analyzeLocal()` - Run heuristics locally

### 3. Heuristics Module

**Embedded in:** `background/worker.ts`, `backend/src/server.ts`

**Local Heuristics:**
1. **Display Name Mismatch** (+25 points)
   - Compare display name with email domain
   - Example: "Amazon Support" from "phisher@evil.com"

2. **Suspicious URLs** (+15 per link)
   - @ symbol (obfuscation)
   - IP address instead of domain
   - URL-encoded characters
   - Unusually long paths (>100 chars)

3. **Urgency Keywords** (+10 points)
   - "verify account", "confirm password"
   - "account suspended", "urgent action required"
   - "unauthorized activity"

**Scoring:**
- Score threshold: 35/100 = SUSPICIOUS
- Score capped at 100
- Multiple issues add up

### 4. React UI Components

**Banner Component:**
- Injected into email DOM after analysis
- Shows: ⚠️ warning icon, risk score, reasons list
- Buttons: Dismiss, Report Phishing
- Styled to match each email client (Gmail dark theme, Outlook blue)

**Options Page:**
- Settings interface (popup + full page)
- Controls: Cloud analysis toggle, Privacy consent checkbox
- Manage: Whitelist trusted senders, view report count
- Danger zone: Clear all data

### 5. Backend API

**File:** `backend/src/server.ts`

**Endpoints:**

```
POST /api/analyze
- Input: email metadata (from, subject, links, body?)
- Output: { suspicious, score, reasons, model }
- Logic: Run server-side heuristics + optional ML

POST /api/report
- Input: from, subject, reason
- Output: { id, status }
- Logic: Log for analytics and model retraining

GET /api/stats (admin)
- Output: aggregated statistics

GET /health
- Liveness probe for monitoring
```

**Future ML Integration:**
- DistilBERT: Pre-trained on phishing datasets, run email text through model
- XGBoost: Extract URL features (domain age, entropy, length, etc.)

## Privacy & Data Flow

### Default (Offline)

```
Email → Content Script → Extract Metadata → Background Worker → Heuristics Analysis
                                                                       ↓
                                                                   Suspicious?
                                                                       ↓
                                                            Inject Banner (if yes)
```

**Stays Local:** All email data stays in memory, never persisted or sent.

### With Cloud Analysis Opt-in

```
Email → Content Script → Extract Metadata → Background Worker → Check user preference
                                                                       ↓
                                            (if cloudAnalysisEnabled) Backend API
                                                                       ↓
                                                            Advanced Analysis Result
                                                                       ↓
                                                            Inject Banner (enhanced)
```

**Before sending:**
1. User enables cloud analysis in options
2. User gives privacy consent
3. Optional: User reports an email (explicit consent needed)

### Storage

```
chrome.storage.sync (browser managed):
├── cloudAnalysisEnabled: boolean
├── privacyConsent: boolean
├── whitelistedSenders: string[]
├── blockedSenders: string[]
└── reportCount: number

Session Memory (cleared on browser close):
├── currentEmailData (last viewed email)
└── analysisResults
```

## Technology Stack

| Layer | Tech | Why? |
|-------|------|-----|
| Extension Packaging | Manifest V3 | Latest standard, best security |
| Build Tool | Vite | Fast HMR, optimized output, plugin support |
| UI Framework | React 18 | Component reusability, state management |
| Language | TypeScript | Type safety, better IDE support |
| Backend | Node.js + Express | JavaScript full-stack, async I/O |
| Testing | Jest + Playwright | Unit tests, end-to-end browser tests |
| Containerization | Docker | Easy deployment, reproducible environment |

## File Structure

```
mailguard/
├── extension/
│   ├── src/
│   │   ├── manifest.json
│   │   ├── background/
│   │   │   └── worker.ts (service worker + heuristics)
│   │   ├── content/
│   │   │   ├── gmail.tsx (Gmail adapter)
│   │   │   └── outlook.tsx (Outlook adapter)
│   │   ├── ui/
│   │   │   ├── banner.tsx (warning banner component)
│   │   │   └── options/
│   │   │       ├── OptionsApp.tsx
│   │   │       ├── OptionsApp.module.css
│   │   │       └── options.html
│   │   └── utils/
│   │       └── storage.ts (chrome.storage wrapper)
│   ├── public/
│   │   └── icons/ (icon-16.png, icon-48.png, icon-128.png)
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.ts (Express app + heuristics)
│   │   ├── routes/
│   │   │   ├── analyze.ts
│   │   │   └── report.ts
│   │   └── ml/ (placeholder for models)
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── package.json
│
├── tests/
│   ├── unit/
│   │   └── heuristics.test.ts
│   ├── e2e/
│   │   └── gmail.spec.ts
│   └── fixtures/
│       └── emails.json (test data)
│
├── .github/
│   └── workflows/
│       ├── build.yml (build & test on PR)
│       └── deploy.yml (deploy backend on merge)
│
├── docs/
│   ├── PRIVACY.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── jest.config.js
├── tsconfig.json
└── package.json
```

## Security Considerations

1. **Content Script Isolation:** Content scripts run in isolated context, cannot access auth tokens
2. **CSP Headers:** Backend enforces Content Security Policy
3. **HTTPS Only:** All backend communication encrypted
4. **Input Validation:** Sanitize all user inputs before analysis
5. **No Persistent Logs:** Email content not logged to disk
6. **Manifest V3:** Stricter security model than Manifest V2

## Performance

- **Content Script:** <50ms to extract email metadata
- **Heuristics Analysis:** <10ms for 10 URLs + keywords check
- **Banner Injection:** <20ms DOM manipulation
- **Total:** <100ms from email open to banner display
- **Backend:** <500ms for advanced ML analysis

## Testing Strategy

1. **Unit Tests:** Heuristic functions (Jest)
   - Display name mismatch detection
   - URL feature extraction
   - Keyword pattern matching

2. **Integration Tests:** Message passing between components
   - Content script → Background worker
   - Background worker → Storage

3. **E2E Tests:** Full flow (Playwright)
   - Load Gmail test page
   - Simulate email open
   - Assert banner appears
   - Click report button
   - Verify backend call

4. **Manual Testing:** Browser extension testing
   - Load in Chrome DevTools
   - Test on real Gmail/Outlook
   - Monitor console for errors

---

**Next:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for build & deployment instructions.
