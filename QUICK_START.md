# ✨ Quick Start: How to Use MailGuard

## 🎯 5-Minute Setup

### Step 1: Load Extension (Already Done ✓)
```
✅ Extension built: /extension/dist/
✅ Icons created: /extension/dist/icons/
✅ Manifest ready: /extension/dist/manifest.json
```

### Step 2: Open Chrome/Brave
1. Type: `chrome://extensions/` (or `brave://extensions/`)
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select: `/Users/sampreetapalanisamy/Documents/MailGuard/extension/dist/`

**Result:** MailGuard appears in your toolbar! ✨

---

## 📧 Test It Immediately

### Test Case 1: Obvious Phishing (Should Alert)
1. Open Gmail
2. Create test email with:
   - **From:** phisher@evil.com
   - **Display Name:** "Amazon Support"
   - **Subject:** "Verify your account immediately"
   - **Link:** any suspicious link

**Expected:** 🚨 Red banner at top with high score (70+)

### Test Case 2: Legitimate Email (Should Pass)
1. Compose email from your real account
2. **From:** your-email@gmail.com
3. **Display Name:** Your Name
4. **Subject:** "Meeting today"

**Expected:** ✅ Green or no warning (score 0-10)

---

## 🧪 How MailGuard Analyzes

```
Email arrives → MailGuard checks:

1️⃣ DISPLAY NAME
   ✓ Does "Amazon Support" match "phisher@evil.com"?
   → NO = +25 points

2️⃣ SUSPICIOUS URLS
   ✓ Contains @ symbol? → +15 points
   ✓ Uses IP address? → +15 points
   ✓ Encoded characters? → +15 points
   ✓ Very long path? → +15 points

3️⃣ URGENCY KEYWORDS
   ✓ "Verify account"? → +10 points
   ✓ "Confirm password"? → +10 points
   ✓ "Account suspended"? → +10 points

TOTAL: 0-100 points
Score < 35 = SAFE ✅
Score ≥ 35 = PHISHING 🚨
```

---

## 📊 What Each Component Does

### Background Worker (`background/worker.ts`)
- 🧠 The "brain" that analyzes emails
- Runs the 24 phishing heuristics
- Calculates security score
- Sends results to content script

### Content Script - Gmail (`content/gmail.tsx`)
- 👀 Watches for emails in Gmail
- Extracts email metadata
- Requests analysis from background worker
- **Injects red/green banner** at top of email

### Content Script - Outlook (`content/outlook.tsx`)
- 👀 Same for Outlook
- Detects Outlook email interface
- Injects banner with results

### Options Page (`ui/options/`)
- ⚙️ Settings (future use)
- User preferences
- Report settings

---

## 🚀 Deployment Routes

### Route 1: Personal Use (Easiest)
```
✅ Already loaded in Chrome
✅ Test on your Gmail
✅ Use for free
❌ Only on this computer
```

### Route 2: Chrome Web Store (Widest Reach)
```
1. Go to: https://chrome.google.com/webstore/category/extensions
2. Click "Publish extension"
3. Upload: /extension/dist/ as .zip
4. Add description & privacy policy
5. Submit for review (1-3 days)
6. ✨ Millions of users can install!

💰 Cost: $5 one-time developer fee
⏱️ Time: 1-2 weeks (including review)
📈 Users: Unlimited
```

### Route 3: GitHub Release (Developers)
```
1. Build: npm run ext:build
2. Create GitHub release
3. Upload: mailguard-v0.1.0.zip
4. Share link with users
5. Users download & load unpacked

💰 Cost: Free
⏱️ Time: 10 minutes
📈 Users: Manual download
```

### Route 4: Corporate Deployment (Enterprise)
```
1. Deploy backend to company server
2. Use Group Policy (Windows) or MDM (Mac/iOS)
3. Force install on all company computers
4. Monitor phishing reports from dashboard

💰 Cost: Server costs
⏱️ Time: 2-4 weeks setup
📈 Users: Company-wide
```

---

## 📈 Current Status

| Component | Status | Test |
|-----------|--------|------|
| Extension Build | ✅ Ready | ✓ |
| Unit Tests | ✅ 24/24 Pass | ✓ |
| Chrome Load | ✅ Can load | ✓ |
| Gmail Detection | ✅ Ready | ← Test now! |
| Outlook Detection | ✅ Ready | ← Test now! |
| Icons | ✅ Included | ✓ |
| Privacy Policy | ✅ Included | ✓ |
| Backend (Optional) | ✅ Ready | Optional |

---

## 🔍 Files Reference

```
📁 MailGuard/
├── 📄 ANALYSIS_AND_DEPLOYMENT.md ← Full details
├── 📄 BUILD_AND_TEST_VERIFICATION.md ← Build info
├── 📁 extension/dist/ ← READY TO LOAD ✓
│  ├── manifest.json
│  ├── background.js
│  ├── content-gmail.js
│  ├── content-outlook.js
│  ├── options.js
│  ├── options.html
│  └── 📁 icons/ ✓
├── 📁 extension/src/ ← Source code
│  ├── 📁 background/
│  │  └── worker.ts (24 heuristics)
│  ├── 📁 content/
│  │  ├── gmail.tsx
│  │  └── outlook.tsx
│  └── 📁 ui/
├── 📁 tests/
│  └── 📁 unit/
│     └── heuristics.test.ts (24/24 ✓)
└── 📁 backend/ (optional)
   └── server.ts (reporting)
```

---

## ⚡ Quick Commands

```bash
# Load in browser (manually via chrome://extensions/)
Already done! ✓

# Rebuild if you make changes
npm run ext:build

# Run tests
npm run test

# Watch mode (auto-rebuild on changes)
npm run ext:dev

# Clean build
npm run clean && npm run ext:build
```

---

## 🎓 Learning Path

Want to understand how it works?

1. **Start here:** This file (you are here!) 📍
2. **Deep dive:** `ANALYSIS_AND_DEPLOYMENT.md`
3. **Tests:** `tests/unit/heuristics.test.ts`
4. **Code:** `extension/src/background/worker.ts`
5. **Content Script:** `extension/src/content/gmail.tsx`

---

## 🚨 Common Issues

### Q: Extension doesn't appear in toolbar?
**A:** Refresh the extensions page (Ctrl+Shift+Del) or reload Chrome

### Q: No banner appears in Gmail?
**A:** 
- Open an email (not the list)
- Wait 2 seconds for banner to inject
- Check browser console (F12) for errors

### Q: How to unload extension?
**A:** Click the trash icon on extensions page

### Q: How to rebuild?
**A:** Run `npm run ext:build` then reload extension (Ctrl+R on extensions page)

---

## ✨ Next: Share with Others

### Option A: Email Link
```
"Hey! Check out MailGuard - a free phishing detector"
"Install from Chrome Web Store: [LINK]"
```

### Option B: Corporate Rollout
```
1. Deploy backend server
2. Set up monitoring dashboard
3. Push to all employees via MDM
4. Train users on alerts
```

### Option C: Open Source Community
```
1. Push to GitHub
2. Create documentation
3. Ask for contributions
4. Build community around it
```

---

**You're all set! 🎉 MailGuard is ready to protect.**

*Start testing on your emails now!*
