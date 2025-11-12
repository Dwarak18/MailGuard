# MailGuard Testing - Copy & Paste Commands

Ready-to-use commands for testing MailGuard. Just copy and paste into terminal or browser console.

---

## 📟 TERMINAL COMMANDS

### 1. Initial Setup
```bash
# Navigate to project
cd /Users/sampreetapalanisamy/Documents/MailGuard

# Install dependencies (run once)
npm install

# Build extension
npm run ext:build

# Run all tests
npm run test

# Check TypeScript
npm run type-check

# Check linting
npm run lint
```

---

### 2. Watch Mode (Development)
```bash
# Watch tests and rebuild on changes
npm run test:unit:watch

# Watch extension build
npm run ext:dev

# Start backend server (separate terminal)
npm run backend:dev

# All three at once
npm run dev
```

---

### 3. Debugging
```bash
# Run tests with verbose output
npm run test -- --verbose

# Run E2E tests
npm run test:e2e

# Debug E2E tests (step through)
npm run test:e2e:debug

# Check for build errors
npm run ext:build 2>&1 | grep -i error
```

---

### 4. Clean & Reset
```bash
# Remove all build files
npm run clean

# Reinstall from scratch
npm run clean && npm install && npm run ext:build
```

---

### 5. Backend Testing
```bash
# Start backend server
npm run backend:dev

# In another terminal, test health endpoint
curl http://localhost:3000/health

# Test analysis endpoint
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "from": "phisher@evil.com",
    "displayName": "Amazon",
    "subject": "Verify account",
    "links": ["https://192.168.1.1/verify"]
  }'

# Test report endpoint
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{
    "from": "phisher@evil.com",
    "subject": "Phishing",
    "reason": "Suspicious links"
  }'
```

---

## 🌐 BROWSER CONSOLE COMMANDS

### Run in Chrome DevTools Console (F12) on Gmail

#### 1. Test Phishing Email Detection
```javascript
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
  console.log('🚨 PHISHING TEST');
  console.log('Suspicious:', response.suspicious);
  console.log('Score:', response.score + '/100');
  console.log('Reasons:', response.reasons);
});
```

#### 2. Test Legitimate Email
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'john.doe@company.com',
    displayName: 'John Doe',
    subject: 'Meeting notes from today',
    links: ['https://company.sharepoint.com/docs'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('✅ LEGITIMATE TEST');
  console.log('Suspicious:', response.suspicious);
  console.log('Score:', response.score + '/100');
  console.log('Reasons:', response.reasons);
});
```

#### 3. Test Paypal Phishing
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'support@paypa1.com',
    displayName: 'PayPal Support Team',
    subject: 'Urgent: Verify your PayPal account immediately',
    links: ['https://192.168.1.1/verify'],
    body: 'Click here to verify your account'
  },
  source: 'gmail'
}, (response) => {
  console.log('💳 PAYPAL PHISHING');
  console.log('Suspicious:', response.suspicious);
  console.log('Score:', response.score);
  console.log('Reasons:', response.reasons);
});
```

#### 4. Test @ Symbol Obfuscation
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'attacker@evil.com',
    displayName: 'Amazon Security',
    subject: 'Confirm your identity',
    links: ['https://evil.com@amazon.com/verify'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('🔗 @ SYMBOL TEST');
  console.log('Suspicious:', response.suspicious);
  console.log('Score:', response.score);
  console.log('Reasons:', response.reasons);
});
```

#### 5. Test URL Encoding
```javascript
chrome.runtime.sendMessage({
  type: 'analyze',
  email: {
    from: 'fake@site.com',
    displayName: 'Support Team',
    subject: 'Reset password',
    links: ['https://site.com/path%2Freset%2Fpassword'],
    body: ''
  },
  source: 'gmail'
}, (response) => {
  console.log('🔐 URL ENCODING TEST');
  console.log('Suspicious:', response.suspicious);
  console.log('Score:', response.score);
  console.log('Reasons:', response.reasons);
});
```

#### 6. Check Storage
```javascript
chrome.storage.sync.get(null, (items) => {
  console.log('📦 STORAGE CONTENTS:');
  console.table(items);
});
```

#### 7. Update Storage
```javascript
chrome.storage.sync.set({
  cloudAnalysisEnabled: true,
  privacyConsent: true,
  whitelistedSenders: ['trusted@company.com']
}, () => {
  console.log('✅ Storage updated');
  chrome.storage.sync.get(null, (items) => {
    console.log('Updated storage:', items);
  });
});
```

#### 8. Add to Whitelist
```javascript
chrome.runtime.sendMessage({
  type: 'whitelist',
  sender: 'john@company.com'
}, (response) => {
  console.log('✅ Added to whitelist:', response);
});
```

#### 9. Send Report
```javascript
chrome.runtime.sendMessage({
  type: 'report',
  email: {
    from: 'phisher@evil.com',
    displayName: 'Fake Amazon',
    subject: 'Verify account',
    links: ['https://192.168.1.1/verify']
  }
}, (response) => {
  console.log('📤 REPORT SENT');
  console.log('Response:', response);
});
```

#### 10. Check Extension Alive
```javascript
chrome.runtime.sendMessage({type: 'ping'}, (response) => {
  console.log('✅ Extension is responsive:', response);
});
```

---

## 📊 BATCH TEST SCRIPT

Copy entire block and paste in browser console:

```javascript
console.log('🧪 STARTING BATCH TESTS...\n');

const tests = [
  {
    name: 'Phishing Email',
    email: {
      from: 'phisher@evil.com',
      displayName: 'Amazon Support',
      subject: 'Verify your account immediately',
      links: ['https://192.168.1.1/verify'],
      body: ''
    },
    expectedScore: 50,
    expectedSuspicious: true
  },
  {
    name: 'Legitimate Email',
    email: {
      from: 'john@company.com',
      displayName: 'John Doe',
      subject: 'Meeting notes',
      links: ['https://company.com/docs'],
      body: ''
    },
    expectedScore: 0,
    expectedSuspicious: false
  },
  {
    name: 'Paypal Phishing',
    email: {
      from: 'support@paypa1.com',
      displayName: 'PayPal Support',
      subject: 'Urgent: Verify account',
      links: ['https://192.168.1.1/verify'],
      body: ''
    },
    expectedScore: 50,
    expectedSuspicious: true
  },
  {
    name: '@ Symbol Obfuscation',
    email: {
      from: 'evil@site.com',
      displayName: 'Amazon',
      subject: 'Confirm identity',
      links: ['https://evil.com@amazon.com/verify'],
      body: ''
    },
    expectedScore: 40,
    expectedSuspicious: true
  }
];

let completed = 0;

tests.forEach((test) => {
  chrome.runtime.sendMessage({
    type: 'analyze',
    email: test.email,
    source: 'gmail'
  }, (response) => {
    completed++;
    const pass = response.suspicious === test.expectedSuspicious;
    const icon = pass ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    console.log(`   Score: ${response.score}/100 (expected ~${test.expectedScore})`);
    console.log(`   Suspicious: ${response.suspicious} (expected ${test.expectedSuspicious})`);
    console.log('');
    
    if (completed === tests.length) {
      console.log('✨ BATCH TEST COMPLETE');
    }
  });
});
```

---

## 🔧 USEFUL DIAGNOSTIC COMMANDS

### Check Extension Status
```bash
# Verify extension was built
ls -la extension/dist/manifest.json

# Check file sizes
du -sh extension/dist/

# List all dist files
find extension/dist -type f | sort

# Check Node version
node --version  # Should be 18+

# Check npm packages
npm list --depth=0
```

### View Logs
```bash
# See TypeScript compilation errors
npm run type-check 2>&1

# See build errors
npm run ext:build 2>&1

# See linting issues
npm run lint

# View test coverage
npm run test -- --coverage --no-coverage-directory
```

---

## 🎯 QUICK TEST WORKFLOWS

### Scenario 1: Complete Fresh Test (15 min)

```bash
# Terminal
cd /Users/sampreetapalanisamy/Documents/MailGuard
npm run clean
npm install
npm run test
npm run ext:build
npm run type-check
npm run lint

# Browser (Chrome)
# Go to: chrome://extensions/
# Load unpacked → extension/dist/
# Go to: gmail.com
# F12 → Console
# Paste: chrome.runtime.sendMessage({...}) (see browser console commands)
```

### Scenario 2: Just Test Latest Changes (5 min)

```bash
# Terminal
npm run ext:build
npm run test:heuristics

# Browser
# F12 on Gmail
# Paste: chrome.runtime.sendMessage({...})
```

### Scenario 3: Backend API Testing (10 min)

```bash
# Terminal 1
npm run backend:dev

# Terminal 2
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"from":"test@test.com","displayName":"Test","subject":"Test","links":[]}'
```

---

## 📋 TESTING CHECKLIST (Copy to Notepad)

```
LOCAL TESTING:
[ ] npm install - No errors
[ ] npm run test - 27/27 passing
[ ] npm run type-check - No errors
[ ] npm run lint - No errors
[ ] npm run ext:build - dist/ created

CHROME SETUP:
[ ] chrome://extensions/ open
[ ] Developer mode enabled
[ ] Load unpacked → dist/ selected
[ ] MailGuard appears in list
[ ] Extension enabled (checkbox on)
[ ] Pinned to toolbar

CHROME TESTING:
[ ] Gmail opens successfully
[ ] F12 → Console accessible
[ ] [MailGuard] message visible
[ ] Phishing test returns score 50+
[ ] Legitimate test returns score 0
[ ] Storage test returns all fields
[ ] Settings page opens

BRAVE TESTING:
[ ] Repeat all Chrome steps
[ ] All tests pass
```

---

## 🚨 EMERGENCY RESTART

If something breaks:

```bash
# Option 1: Just rebuild
npm run ext:build

# Option 2: Clean rebuild
npm run clean && npm install && npm run ext:build

# Option 3: Complete reset
rm -rf node_modules package-lock.json extension/dist
npm install
npm run ext:build
npm run test
```

---

## 📞 Quick Reference

| Command | What it does |
|---------|-------------|
| `npm run ext:build` | Build extension to dist/ |
| `npm run test` | Run 27 unit tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run backend:dev` | Start API server |
| `npm run type-check` | Check TypeScript |
| `npm run lint` | Check code style |
| `npm run clean` | Delete all built files |

| URL | Purpose |
|-----|---------|
| `chrome://extensions/` | Chrome extensions manager |
| `brave://extensions/` | Brave extensions manager |
| `https://mail.google.com` | Gmail |
| `http://localhost:3000` | Backend API |
| `http://localhost:3000/health` | Backend health check |

---

**Last Updated:** November 12, 2025
**Ready to Copy & Paste:** Yes ✅
**Time Saved:** ~20 minutes per test cycle

