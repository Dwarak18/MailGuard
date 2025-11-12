# MailGuard Testing Guide - Local & Browser Testing

Complete step-by-step guide to test MailGuard locally and on Chrome/Brave browsers.

---

## 🚀 Part 1: Local Testing (Before Browser)

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd /Users/sampreetapalanisamy/Documents/MailGuard

# Install all dependencies
npm install

# This installs:
# - Extension dependencies (React, TypeScript)
# - Backend dependencies (Express, Node.js)
# - Testing tools (Jest, Playwright)
```

**Expected Output:**
```
✓ added 500+ packages in 45s
✓ Vulnerabilities: 0
```

---

### Step 2: Build the Extension

```bash
# Build extension for development
npm run ext:build

# This compiles:
# - TypeScript → JavaScript
# - JSX → React components
# - Creates extension/dist/ folder
```

**Expected Output:**
```
✓ extension built in 12s
✓ Output: extension/dist/
✓ Files:
  - manifest.json
  - background/worker.js
  - content/gmail.js
  - content/outlook.js
  - ui/options/index.html
```

---

### Step 3: Run Unit Tests

```bash
# Run all unit tests
npm run test

# Or specifically for heuristics
npm run test:heuristics

# Watch mode (re-run on file changes)
npm run test:unit:watch
```

**Expected Output:**
```
PASS  tests/unit/heuristics.test.ts
  URL Heuristics
    ✓ should detect @ symbol in URL (2ms)
    ✓ should detect IP address instead of domain (1ms)
    ✓ should detect unusually long paths (1ms)
    ✓ should detect URL-encoded characters (1ms)
    ✓ should flag invalid URLs (1ms)
    ✓ should not flag legitimate URLs (1ms)
    ✓ should handle multiple issues in one URL (1ms)

  Display Name Heuristics
    ✓ should detect mismatch (1ms)
    ✓ should not flag matching names (1ms)
    ✓ should be case-insensitive (1ms)
    ✓ should handle single names (1ms)
    ✓ should flag impersonation attempts (1ms)

  Urgency Keywords Detection
    ✓ should detect verify account triggers (1ms)
    ✓ should detect confirm password triggers (1ms)
    ✓ should detect account suspension (1ms)
    ✓ should detect urgent action required (1ms)
    ✓ should detect unauthorized activity (1ms)
    ✓ should not flag legitimate emails (1ms)
    ✓ should be case-insensitive (1ms)
    ✓ should detect multiple triggers (1ms)

  Integration Tests
    ✓ should correctly identify a phishing email (2ms)
    ✓ should correctly identify a legitimate email (1ms)
    ✓ should detect credit card phishing (1ms)

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Coverage:    85% | 92 statements | 8 branches
```

✅ **All tests should PASS**

---

### Step 4: Run E2E Tests (Optional)

```bash
# Run end-to-end tests
npm run test:e2e

# Debug mode (step through tests)
npm run test:e2e:debug
```

**Expected Output:**
```
Running 13 tests in 3 workers
✓ email-classification (2.3s)
✓ phishing-detection (2.1s)
✓ ui-interaction (1.8s)
✓ privacy-controls (1.5s)
... (9 more tests)

13 passed (15.2s)
```

---

### Step 5: Type Check

```bash
# Check TypeScript types
npm run type-check

# Should output nothing if all types are correct
# Or list any type errors if they exist
```

**Expected Output:**
```
✓ No TypeScript errors
```

---

### Step 6: Backend Setup (Optional)

```bash
# Start backend API server (in separate terminal)
npm run backend:dev

# Server runs on http://localhost:3000
```

**Expected Output:**
```
[2025-11-12T10:30:45.123Z] Server running on http://localhost:3000
[2025-11-12T10:30:45.456Z] Environment: development
```

---

## ✅ Part 2: Google Chrome Testing

### Step 1: Open Extension Loading Page

```
1. Open Chrome browser
2. Go to: chrome://extensions/
3. Enable "Developer mode" (toggle in top-right corner)
```

**Screenshot locations:**
- Top right corner: Toggle switch labeled "Developer mode"

---

### Step 2: Load Unpacked Extension

```
1. Click "Load unpacked" button
2. Navigate to: /Users/sampreetapalanisamy/Documents/MailGuard/extension/dist/
3. Select the dist folder (click "Open")
4. ✅ Extension should appear in the list
```

**What you should see:**
```
MailGuard
Version: 0.1.0
enabled [toggle is ON]
ID: abhdjfh23jh23jh23j (random)
Manifest Version: 3
```

---

### Step 3: Pin Extension to Toolbar

```
1. In chrome://extensions/
2. Find MailGuard extension
3. Click the "pin" icon to add to toolbar
4. You should see MailGuard icon in top-right toolbar
```

---

### Step 4: Test on Gmail

#### Test A: Verify Extension Loads

```
1. Go to https://mail.google.com
2. Sign in with your Google account
3. Open any email
4. Open DevTools (F12)
5. Go to "Console" tab
6. Look for message:
   [MailGuard] Gmail content script loaded ✓
```

**If you don't see the message:**
- Check browser console for errors
- Refresh page (Ctrl+Shift+R)
- Reload extension in chrome://extensions/

#### Test B: Send Test Email via Console

```javascript
// Open DevTools Console (F12) and paste:

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
  console.log('🔍 Analysis Result:', response);
  console.log('Suspicious?', response.suspicious);
  console.log('Score:', response.score + '/100');
  console.log('Reasons:', response.reasons);
});
```

**Expected Console Output:**
```
🔍 Analysis Result: {
  suspicious: true,
  score: 50,
  reasons: [
    'Display name "Amazon Support" doesn\'t match sender address "phisher@evil.com"',
    'URL uses IP address instead of domain: https://192.168.1.1/verify',
    'Contains urgency trigger: "verify"'
  ],
  source: 'local'
}
Suspicious? true
Score: 50/100
Reasons: (3) ['Display name...', 'URL...', 'Contains...']
```

#### Test C: Check Storage

```javascript
// Open DevTools Console and paste:

chrome.storage.sync.get(null, (items) => {
  console.log('📦 Extension Storage:', items);
});
```

**Expected Output:**
```
📦 Extension Storage: {
  cloudAnalysisEnabled: false,
  whitelistedSenders: [],
  blockedSenders: [],
  reportCount: 0,
  privacyConsent: false
}
```

#### Test D: Test Warning Banner (Manual)

If you want to test the actual banner injection:

```javascript
// Create a test email container and inject banner
// (Advanced: requires knowledge of Gmail's DOM structure)
```

**Alternative:** Open email and look for banner automatically if it's phishing.

---

### Step 5: Check Background Worker

```
1. Go to chrome://extensions/
2. Find MailGuard extension
3. Under "Service worker" section, click "Inspect"
4. This opens background worker console
5. Look for logs like:
   [MailGuard] Message received: analyze
   [MailGuard] Analysis result: {suspicious: true, score: 50}
```

---

### Step 6: Test Settings Page

```
1. Right-click MailGuard icon in toolbar
2. Click "Options" (or "Manage extension" → Details → "Extension options")
3. Should open a settings page with:
   ✓ Cloud Analysis toggle
   ✓ Privacy Consent checkbox
   ✓ Whitelist management
   ✓ Report count display
   ✓ Clear data button
```

---

## ⚡ Part 3: Brave Browser Testing

Brave is Chromium-based, so process is almost identical to Chrome.

### Step 1: Open Extension Settings

```
1. Open Brave browser
2. Click menu icon (≡) → Extensions → Manage extensions
   OR: Go to brave://extensions/
3. Enable "Developer mode" (toggle in top-right)
```

---

### Step 2: Load Extension

```
1. Click "Load unpacked"
2. Navigate to: /Users/sampreetapalanisamy/Documents/MailGuard/extension/dist/
3. Select dist folder
4. ✅ MailGuard should appear
```

---

### Step 3: Test on Gmail (Same as Chrome)

```
1. Go to https://mail.google.com
2. Sign in
3. Open email
4. F12 for DevTools
5. Run same test scripts as Chrome section
```

---

### Step 4: Additional Brave Features

Brave might have additional privacy settings:

```
1. Click MailGuard icon
2. Check "Permissions" tab
3. Verify:
   ✓ Read and change all data on mail.google.com
   ✓ Read and change all data on outlook.live.com
   ✓ Access your data on all websites
```

---

## 🧪 Part 4: Comprehensive Test Checklist

### Pre-Browser Tests ✅

- [ ] Dependencies installed: `npm install` completes without errors
- [ ] Extension builds: `npm run ext:build` produces dist folder
- [ ] Unit tests pass: `npm run test` shows 27/27 tests passing
- [ ] No TypeScript errors: `npm run type-check` completes
- [ ] No linting errors: `npm run lint` passes

### Chrome/Brave Tests ✅

- [ ] Extension loads: Visible in chrome://extensions/
- [ ] Extension appears in toolbar: Pin icon visible
- [ ] Gmail content script loads: Console shows `[MailGuard] Gmail content script loaded`
- [ ] Analysis works: Console test returns proper score
- [ ] Storage works: chrome.storage.sync returns all fields
- [ ] Background worker active: "Service worker" shows "Inspect" option
- [ ] Settings page opens: Right-click extension → Options
- [ ] Banner styling: Visible and readable (if email is phishing)

### Email Provider Tests ✅

**Gmail:**
- [ ] Content script detects emails
- [ ] Banner injects properly
- [ ] Analysis runs locally
- [ ] Report button works

**Outlook Web (Optional):**
- [ ] Content script loads for outlook.live.com
- [ ] Email extraction works
- [ ] Banner styles correctly

---

## 🔍 Part 5: Debugging & Troubleshooting

### Issue: Content script not loading

**Symptoms:**
```
Console shows: No [MailGuard] messages
Banner doesn't appear
```

**Solutions:**
```bash
# 1. Rebuild extension
npm run ext:build

# 2. Reload extension
chrome://extensions/ → Find MailGuard → Reload button

# 3. Hard refresh page
Ctrl+Shift+R (on Gmail page)

# 4. Check manifest
cat extension/dist/manifest.json

# 5. Check permissions in manifest
grep -A 5 "permissions" extension/dist/manifest.json
```

---

### Issue: Tests failing

**Symptoms:**
```
FAIL tests/unit/heuristics.test.ts
Tests: X failed, Y passed
```

**Solutions:**
```bash
# 1. Clear cache
npm run clean
npm install

# 2. Run single test file
npm run test heuristics.test.ts

# 3. Run with verbose output
npm run test -- --verbose

# 4. Check Node version
node --version  # Should be 18+
```

---

### Issue: Extension errors in chrome://extensions/

**Solutions:**
```bash
# 1. Check for TypeScript errors
npm run type-check

# 2. Check for build errors
npm run ext:build 2>&1 | grep -i error

# 3. View detailed error logs
chrome://extensions/ → MailGuard → "Details" → "Errors"
```

---

### Issue: Storage not working

**Solutions:**
```javascript
// Test storage access
chrome.storage.sync.set({test: 'value'}, () => {
  console.log('Storage write succeeded');
});

chrome.storage.sync.get('test', (result) => {
  console.log('Storage read:', result);
});
```

---

## 📊 Part 6: Test Email Samples

Use these test emails to verify detection:

### Phishing Example 1
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'support@paypa1.com',
    displayName: 'PayPal Support Team',
    subject: 'Urgent: Verify your PayPal account immediately',
    links: ['https://192.168.1.1/verify'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('Result:', response);
  // Expected: suspicious: true, score: 50-60
});
```

### Phishing Example 2 (Display Name Mismatch)
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'evil@attacker.com',
    displayName: 'Amazon Security Team',
    subject: 'Confirm your identity now',
    links: ['https://evil.com@amazon.com/verify'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('Result:', response);
  // Expected: suspicious: true, score: 40+
});
```

### Phishing Example 3 (IP Address)
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'noreply@bankfake.com',
    displayName: 'Your Bank',
    subject: 'Update payment method',
    links: ['https://10.0.0.1/update'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('Result:', response);
  // Expected: suspicious: true, score: 45+
});
```

### Legitimate Example
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'john.doe@company.com',
    displayName: 'John Doe',
    subject: 'Meeting notes from today',
    links: ['https://company.sharepoint.com/docs/meeting-notes'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('Result:', response);
  // Expected: suspicious: false, score: 0
});
```

---

## 📋 Part 7: Testing Workflow Summary

### Quick Start (10 minutes)

```bash
# Terminal 1: Install and build
cd /Users/sampreetapalanisamy/Documents/MailGuard
npm install
npm run ext:build
npm run test

# Terminal 2: Open Chrome
# 1. chrome://extensions/
# 2. Load unpacked → select extension/dist/
# 3. Go to mail.google.com
# 4. F12 → Console
# 5. Run test message (from Part 5)
```

### Full Testing (30 minutes)

1. ✅ **Local Tests** (5 min)
   ```bash
   npm run test
   npm run type-check
   npm run lint
   ```

2. ✅ **Chrome Setup** (5 min)
   ```
   chrome://extensions/
   Load unpacked → dist/
   Pin to toolbar
   ```

3. ✅ **Gmail Test** (10 min)
   ```
   Go to mail.google.com
   F12 → Console
   Test detection with samples
   Test storage access
   ```

4. ✅ **Brave Test** (5 min)
   ```
   brave://extensions/
   Load unpacked → dist/
   Repeat Gmail tests
   ```

5. ✅ **Settings Test** (5 min)
   ```
   Right-click icon → Options
   Toggle cloud analysis
   Accept privacy policy
   Test report function
   ```

---

## 🎯 Success Criteria

**Local Tests Passing:**
- ✅ 27/27 unit tests pass
- ✅ 0 TypeScript errors
- ✅ 0 linting errors
- ✅ Extension builds without errors

**Chrome/Brave Tests Passing:**
- ✅ Extension loads and enables
- ✅ Content script appears in console
- ✅ Analysis returns correct score for phishing email
- ✅ Analysis returns 0 score for legitimate email
- ✅ Storage saves and retrieves data
- ✅ Settings page loads
- ✅ Banner styling is visible

---

## 🚀 Next Steps

Once all tests pass:

1. **Real Gmail Testing:** Try with actual phishing emails (carefully!)
2. **Outlook Testing:** Switch to Outlook and repeat tests
3. **Backend Integration:** Start backend and test cloud analysis
4. **E2E Testing:** Run full integration tests
5. **Deployment:** Package for Chrome Web Store / Firefox Add-ons

---

## 📞 Support

If tests are failing:

1. Check logs: DevTools Console (F12)
2. Read errors carefully
3. Consult: [QUICKSTART.md](./QUICKSTART.md) or [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
4. Check existing issues on GitHub

---

**Last Updated:** November 12, 2025
**Version:** MailGuard v1.0
**Tested On:** Chrome 120+, Brave 1.x, Node 18+
