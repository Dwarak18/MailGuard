# MailGuard Testing Quick Checklist

Fast reference guide for testing MailGuard.

---

## 🚀 QUICK START (Copy & Paste)

### Terminal Setup (5 minutes)

```bash
# 1. Navigate to project
cd /Users/sampreetapalanisamy/Documents/MailGuard

# 2. Install
npm install

# 3. Build
npm run ext:build

# 4. Test
npm run test

# 5. Backend (optional, in new terminal)
npm run backend:dev
```

---

## ✅ CHROME SETUP (5 minutes)

```
1. Open: chrome://extensions/
2. Toggle: "Developer mode" (top-right)
3. Click: "Load unpacked"
4. Select: /Users/sampreetapalanisamy/Documents/MailGuard/extension/dist/
5. Check: MailGuard appears in list ✓
6. Pin: Click pin icon to add to toolbar ✓
```

---

## ✅ BRAVE SETUP (5 minutes)

```
1. Open: brave://extensions/
2. Toggle: "Developer mode" (top-right)
3. Click: "Load unpacked"
4. Select: /Users/sampreetapalanisamy/Documents/MailGuard/extension/dist/
5. Check: MailGuard appears in list ✓
6. Pin: Click pin icon to add to toolbar ✓
```

---

## ✅ TEST ON GMAIL (10 minutes)

### Verify Extension Loads
```
1. Go to: https://mail.google.com
2. Open any email
3. Press: F12 (open DevTools)
4. Check Console for: [MailGuard] Gmail content script loaded ✓
```

### Test Phishing Detection
```
1. Keep DevTools open (F12)
2. Paste in Console:

chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'phisher@evil.com',
    displayName: 'Amazon Support',
    subject: 'Verify your account immediately',
    links: ['https://192.168.1.1/verify'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('Analysis:', response);
});

3. Look for output:
   ✓ suspicious: true
   ✓ score: 50-60 (out of 100)
   ✓ reasons: [3 items]
```

### Test Legitimate Email
```
1. Paste in Console:

chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'john@company.com',
    displayName: 'John Doe',
    subject: 'Meeting notes',
    links: ['https://company.sharepoint.com/docs'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('Analysis:', response);
});

2. Look for output:
   ✓ suspicious: false
   ✓ score: 0
   ✓ reasons: []
```

### Test Storage
```
1. Paste in Console:

chrome.storage.sync.get(null, (items) => {
  console.log('Storage:', items);
});

2. Look for output with:
   ✓ cloudAnalysisEnabled: false
   ✓ privacyConsent: false
   ✓ whitelistedSenders: []
```

---

## ✅ TEST SETTINGS PAGE

```
1. Right-click MailGuard icon in toolbar
2. Click "Options"
3. Should see:
   ✓ Cloud Analysis toggle
   ✓ Privacy Consent checkbox
   ✓ Whitelist section
   ✓ Clear data button
```

---

## ✅ TESTING MATRIX

| Test | Chrome | Brave | Notes |
|------|--------|-------|-------|
| Extension loads | ✓ | ✓ | Should appear in extensions list |
| Content script | ✓ | ✓ | Check console for [MailGuard] message |
| Phishing detection | ✓ | ✓ | Should return score 50+ |
| Legitimate email | ✓ | ✓ | Should return score 0 |
| Storage access | ✓ | ✓ | Should return all settings |
| Settings page | ✓ | ✓ | Should have toggles and buttons |
| Backend API | ✓ | ✓ | Optional: test with curl |

---

## ❌ TROUBLESHOOTING

### Problem: No console message
```
Solution:
1. Reload extension: chrome://extensions → MailGuard → Reload
2. Hard refresh page: Ctrl+Shift+R
3. Check for errors: DevTools → Console
```

### Problem: Tests failing
```
Solution:
npm run clean
npm install
npm run test
```

### Problem: Extension won't load
```
Solution:
1. Rebuild: npm run ext:build
2. Check errors: chrome://extensions → Details
3. Delete dist/ folder and rebuild
```

### Problem: Response is undefined
```
Solution:
1. Wait for async response
2. Check extension is enabled: chrome://extensions/
3. Check permissions in manifest.json
```

---

## 📊 PHISHING TEST EMAILS

### Email 1: Paypal Phishing
```
from: support@paypa1.com
displayName: PayPal Support Team
subject: Urgent: Verify your PayPal account immediately
links: https://192.168.1.1/verify

Expected: score 50-60 ⚠️ SUSPICIOUS
```

### Email 2: Amazon Phishing
```
from: noreply@amazon-security.co
displayName: Amazon Account Services
subject: Confirm your identity
links: https://evil.com@amazon.com/verify

Expected: score 55-65 ⚠️ SUSPICIOUS
```

### Email 3: Bank Phishing
```
from: noreply@bankfake.com
displayName: Your Bank
subject: Update payment method urgently
links: https://10.0.0.1/update%2Fpayment

Expected: score 45-55 ⚠️ SUSPICIOUS
```

### Email 4: Legitimate Email
```
from: john.doe@company.com
displayName: John Doe
subject: Meeting notes
links: https://company.sharepoint.com/docs

Expected: score 0 ✅ LEGITIMATE
```

---

## 🎯 SUCCESS CRITERIA

### All tests must pass:
- [x] npm run test passes (27/27)
- [x] npm run type-check passes (0 errors)
- [x] Extension loads in Chrome
- [x] Extension loads in Brave
- [x] Content script shows in console
- [x] Analysis returns correct scores
- [x] Storage works
- [x] Settings page opens

---

## 📁 KEY FILES FOR TESTING

| File | Purpose |
|------|---------|
| `extension/dist/` | Loaded into browser |
| `tests/unit/heuristics.test.ts` | 27 test cases |
| `tests/fixtures/emails.json` | Test data |
| `extension/src/background/worker.ts` | Main logic |
| `package.json` | Build scripts |

---

## 🔗 USEFUL COMMANDS

```bash
# Build extension
npm run ext:build

# Run tests
npm run test

# Watch tests (re-run on change)
npm run test:unit:watch

# Type check
npm run type-check

# Lint
npm run lint

# Build backend
npm run backend:build

# Start backend
npm run backend:dev

# Clean everything
npm run clean
```

---

## 🌐 USEFUL URLS

| URL | Purpose |
|-----|---------|
| chrome://extensions/ | Manage Chrome extensions |
| brave://extensions/ | Manage Brave extensions |
| https://mail.google.com | Test on Gmail |
| https://outlook.live.com | Test on Outlook |
| http://localhost:3000 | Backend API (if running) |
| http://localhost:3000/health | Backend health check |

---

## 📞 QUICK LINKS

- [Full Testing Guide](./TESTING_GUIDE.md)
- [Architecture Docs](./docs/ARCHITECTURE.md)
- [Quick Start](./QUICKSTART.md)
- [Phishing Data Locations](./PHISHING_DATA_LOCATIONS.md)

---

**Last Updated:** November 12, 2025
**Time to Test:** ~30 minutes
**Success Rate:** 100% if following guide

