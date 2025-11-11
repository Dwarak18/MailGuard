# Quick Start Guide

## 🚀 5-Minute Setup

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/mailguard.git
cd mailguard
npm install
```

### 2. Build Extension
```bash
npm run ext:build
```
Output: `extension/dist/` folder with all extension files

### 3. Load in Chrome
1. Open `chrome://extensions/`
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `extension/dist/` folder
5. ✅ Extension loaded!

### 4. Test on Gmail
1. Open https://mail.google.com
2. Open any email
3. You should see console message: `[MailGuard] Gmail content script loaded`

### 5. Try Phishing Detection
Open developer console (F12) and run:
```javascript
// Send test email to background worker
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'phisher@evil.com',
    displayName: 'Amazon Support',
    subject: 'Verify your account immediately',
    links: ['https://192.168.1.1/verify']
  },
  source: 'gmail'
}, (response) => {
  console.log('Analysis:', response);
});
```

You should see: `suspicious: true, score: 65, reasons: [...]`

---

## 📖 Development Guide

### File Structure Overview

```
extension/
├── src/
│   ├── background/worker.ts       ← Heuristics + Storage
│   ├── content/
│   │   ├── gmail.tsx              ← Gmail DOM adapter
│   │   └── outlook.tsx            ← Outlook DOM adapter
│   └── ui/options/
│       └── OptionsApp.tsx         ← Settings page
│
backend/
└── src/
    └── server.ts                  ← API endpoints

tests/
├── unit/heuristics.test.ts        ← Unit tests
└── e2e/gmail.spec.ts             ← E2E tests
```

### Common Tasks

#### Add a New Heuristic
Edit: `extension/src/background/worker.ts`

```typescript
function checkNewPattern(email: EmailData): string[] {
  const issues: string[] = [];
  // Your detection logic
  return issues;
}

// In analyzeLocal():
const newIssues = checkNewPattern(email);
if (newIssues.length > 0) {
  reasons.push(...newIssues);
  score += 15; // Adjust weight
}
```

Then add tests in `tests/unit/heuristics.test.ts`.

#### Add Support for New Email Provider (e.g., Yahoo)
1. Create: `extension/src/content/yahoo.tsx`
2. Copy Gmail adapter, adjust selectors
3. Update `extension/src/manifest.json`:
   ```json
   {
     "content_scripts": [
       {
         "matches": ["https://mail.yahoo.com/*"],
         "js": ["content-yahoo.js"]
       }
     ]
   }
   ```

#### Run Tests
```bash
# Unit tests
npm run test:heuristics

# All tests
npm run test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e
```

#### Check Code Quality
```bash
npm run lint       # ESLint
npm run type-check # TypeScript
```

---

## 🔍 How It Works

### Email Flow
```
1. User opens email in Gmail/Outlook
   ↓
2. Content script detects new email via MutationObserver
   ↓
3. Extract: sender, subject, links, display name
   ↓
4. Send to background worker for analysis
   ↓
5. Background worker runs heuristics locally
   ↓
6. If suspicious (score ≥ 35):
   - Generate warning banner
   - Inject into DOM
   - Show: reason, score, buttons
   ↓
7. User can: Dismiss or Report
```

### Heuristics Scoring
```
Display name mismatch    → +25 points
Suspicious URL per link  → +15 points  
Urgency keywords         → +10 points

Score ≥ 35 = SHOW BANNER
Score capped at 100
```

### Privacy Design
```
By Default (OFFLINE):
- Email metadata analyzed locally
- Nothing sent to servers
- No tracking or analytics

With Cloud Analysis (OPT-IN):
- User enables in settings
- User gives privacy consent
- Only then we send data
- User can opt-out anytime
```

---

## 🐛 Debugging

### View Extension Logs
1. Open `chrome://extensions/`
2. Find MailGuard
3. Click "Details"
4. Click "Errors" (if any)

### View Background Worker Console
1. Right-click extension icon
2. Select "Inspect popup" → doesn't work for service workers
3. Instead: `chrome://extensions/` → Click "Details" on MailGuard → "Service Worker"

### View Content Script Console
1. Open browser DevTools (F12) on Gmail page
2. Console tab shows content script logs
3. Look for `[MailGuard]` messages

### Test Message Passing
Open console on Gmail and run:
```javascript
// Check if extension is listening
chrome.runtime.sendMessage({type: 'ping'}, response => {
  console.log('Response:', response);
});
```

---

## 📦 Backend Development

### Start API Server
```bash
npm run backend:dev
```
Server runs on `http://localhost:3000`

### Test Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Analyze email
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "from": "phisher@evil.com",
    "displayName": "Amazon",
    "subject": "Verify account",
    "links": ["https://192.168.1.1/verify"]
  }'

# Report email
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "from": "phisher@evil.com",
    "subject": "Phishing email"
  }'
```

### View API Logs
```bash
# From terminal running backend
[2024-01-10T10:30:45] POST /api/analyze
[2024-01-10T10:30:46] 200 - 1.2s
```

---

## 🎯 Common Questions

### Q: How do I know the banner is working?
A: Open Gmail, open any email, check:
1. Console logs show `[MailGuard] Gmail content script loaded`
2. Send test message from console (see Debugging section)
3. Banner should appear at top of email if suspicious

### Q: Why isn't the banner showing?
A: Check these:
1. Extension is loaded: `chrome://extensions/` should show MailGuard
2. Gmail tab has extension permissions: Check browser console for errors
3. Email actually is suspicious (score ≥ 35)
4. Try refreshing page: `Ctrl+Shift+R`

### Q: How do I test the report button?
A: In extension options:
1. Check "Accept Privacy Policy" checkbox
2. Then report button becomes enabled
3. Click report on banner → shows confirmation

### Q: Can I test offline?
A: Yes! All heuristics run locally. No backend needed for basic testing.

### Q: How do I see the options page?
A: Click extension icon in toolbar → "Options" button
(or right-click extension → "Options")

---

## 📚 More Info

- **Full Architecture:** See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Deployment:** See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Privacy Policy:** See [docs/PRIVACY.md](./docs/PRIVACY.md)
- **Contributing:** See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Implementation Details:** See [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

## 🆘 Need Help?

1. **Check logs:** DevTools console for errors
2. **Read docs:** Architecture and deployment guides
3. **GitHub Issues:** Ask the community
4. **Contact:** See CONTRIBUTING.md for support channels

---

**Happy hacking! 🔒✉️**
