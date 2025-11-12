# MailGuard Testing Overview - Start Here! 🚀

Complete guide to test MailGuard locally and on Chrome/Brave browsers. Choose your testing path below.

---

## 📚 Quick Navigation

| Time | Complexity | Document | Purpose |
|------|-----------|----------|---------|
| **5 min** | ⭐ | [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) | Quick checklist of all tests |
| **10 min** | ⭐⭐ | [TESTING_COMMANDS.md](./TESTING_COMMANDS.md) | Copy & paste commands |
| **20 min** | ⭐⭐⭐ | [BROWSER_TESTING_VISUAL.md](./BROWSER_TESTING_VISUAL.md) | Step-by-step with visuals |
| **30 min** | ⭐⭐⭐⭐ | [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Complete comprehensive guide |

---

## 🎯 Choose Your Path

### Path A: "Just the Commands" (10 minutes)

👉 **Go to:** [TESTING_COMMANDS.md](./TESTING_COMMANDS.md)

**Best for:** Experienced developers who know what they're doing

**What you get:**
- Copy & paste terminal commands
- Copy & paste browser console tests
- Quick reference tables

---

### Path B: "Quick Checklist" (5 minutes)

👉 **Go to:** [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

**Best for:** Quick verification everything works

**What you get:**
- Simple checkbox list
- Essential commands only
- Success criteria

---

### Path C: "Visual Step-by-Step" (20 minutes)

👉 **Go to:** [BROWSER_TESTING_VISUAL.md](./BROWSER_TESTING_VISUAL.md)

**Best for:** Visual learners, first-time testers

**What you get:**
- Visual diagrams of each step
- Expected screenshots
- Common issues & fixes
- Detailed walkthroughs

---

### Path D: "Complete Guide" (30 minutes)

👉 **Go to:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)

**Best for:** Thorough understanding of all components

**What you get:**
- All setup steps explained
- Unit tests covered
- E2E tests covered
- Debugging techniques
- Complete troubleshooting
- Multiple browser testing

---

## ⚡ Fastest Way to Test (5 minutes)

### Terminal
```bash
cd /Users/sampreetapalanisamy/Documents/MailGuard
npm install && npm run test && npm run ext:build
```

### Browser
```
1. Open: chrome://extensions/
2. Enable Developer mode (toggle)
3. Load unpacked → extension/dist/
4. Go to: mail.google.com
5. F12 → Console → Paste test command (from TESTING_COMMANDS.md)
```

**Done!** ✅

---

## 📋 What Gets Tested

### Local Tests (Run with npm)

```
✅ Unit Tests (27 tests)
   ├─ URL detection (8 tests)
   ├─ Display name checking (6 tests)
   ├─ Keyword detection (9 tests)
   └─ Integration tests (4 tests)

✅ Type Safety
   └─ TypeScript compiler check

✅ Code Quality
   └─ ESLint rules
```

### Browser Tests (Manual on Gmail)

```
✅ Extension Loads
   └─ Appears in extensions list

✅ Content Script Works
   └─ Detects Gmail page

✅ Analysis Engine
   ├─ Phishing detection (score 50+)
   ├─ Legitimate emails (score 0)
   └─ Edge cases

✅ Storage Works
   └─ Saves preferences

✅ Settings Page
   └─ UI loads and functions
```

---

## 🏁 Expected Results

### Local Tests
```
PASS  tests/unit/heuristics.test.ts
Tests: 27 passed, 27 total ✅
```

### Browser Console (Phishing Test)
```
Suspicious: true ✅
Score: 50-60 out of 100 ✅
Reasons: Array with 3+ items ✅
```

### Browser Console (Legitimate Test)
```
Suspicious: false ✅
Score: 0 out of 100 ✅
Reasons: Empty array ✅
```

### Browser Console (Storage Test)
```
cloudAnalysisEnabled: false ✅
privacyConsent: false ✅
whitelistedSenders: [] ✅
reportCount: 0 ✅
```

---

## 🔑 Key Test Scenarios

### 1. Display Name Mismatch
```
Email from:    phisher@evil.com
Display name:  Amazon Support
Expected:      PHISHING DETECTED ✅
Score:         50+
```

### 2. IP Address in URL
```
URL:           https://192.168.1.1/verify
Expected:      PHISHING DETECTED ✅
Score:         50+
```

### 3. URL Obfuscation
```
URL:           https://evil.com@amazon.com/verify
Expected:      PHISHING DETECTED ✅
Score:         50+
```

### 4. Urgency Keywords
```
Subject:       Verify account immediately
Expected:      PHISHING DETECTED ✅
Score:         50+
```

### 5. Legitimate Email
```
From:          john@company.com
Subject:       Meeting notes
Expected:      LEGITIMATE ✅
Score:         0
```

---

## 🌐 Browser Compatibility

| Browser | Status | Command |
|---------|--------|---------|
| **Chrome** | ✅ Fully Tested | `chrome://extensions/` |
| **Brave** | ✅ Fully Tested | `brave://extensions/` |
| **Firefox** | ⏳ Future | Not yet tested |
| **Edge** | ⏳ Future | Not yet tested |

---

## 📁 Related Documents

| Document | Focus |
|----------|-------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute setup |
| [PHISHING_DATA_LOCATIONS.md](./PHISHING_DATA_LOCATIONS.md) | Where phishing data is stored |
| [MAILGUARD_WORKFLOW_DIAGRAM.md](./MAILGUARD_WORKFLOW_DIAGRAM.md) | System architecture diagrams |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Detailed architecture |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |

---

## ❓ Common Questions

### Q: Which document should I read?
**A:** If new to testing, start with [BROWSER_TESTING_VISUAL.md](./BROWSER_TESTING_VISUAL.md). If experienced, use [TESTING_COMMANDS.md](./TESTING_COMMANDS.md).

### Q: How long does testing take?
**A:** 5-30 minutes depending on thoroughness. Minimum is just running tests and loading in browser (10 min).

### Q: What if tests fail?
**A:** Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) "Troubleshooting" section, or [TESTING_COMMANDS.md](./TESTING_COMMANDS.md) "Emergency Restart".

### Q: Can I test on both Chrome and Brave?
**A:** Yes! Both are Chromium-based, so process is identical. Testing on both is recommended.

### Q: Do I need a real Gmail account?
**A:** Yes, but can use a test account. Need to be signed in to Gmail.

### Q: Can I test the backend?
**A:** Yes! Optional. See backend section in [TESTING_GUIDE.md](./TESTING_GUIDE.md).

---

## ✨ Success Indicators

Your testing is successful when:

✅ All 27 unit tests pass locally
✅ Extension loads in Chrome without errors
✅ Extension loads in Brave without errors
✅ Console shows `[MailGuard] Gmail content script loaded`
✅ Phishing email test returns score 50+
✅ Legitimate email test returns score 0
✅ Storage contains all expected fields
✅ Settings page opens and has toggles

**If you see all these, you're done!** 🎉

---

## 🚀 Ready to Start?

### Fastest Start (Just Commands)
```bash
→ Go to: TESTING_COMMANDS.md
→ Copy terminal commands
→ Copy browser console commands
→ Done in 10 minutes!
```

### Best for Learning (Step-by-Step)
```
→ Go to: BROWSER_TESTING_VISUAL.md
→ Follow visual guide
→ Understand each step
→ Done in 20 minutes!
```

### Complete Understanding (Full Details)
```
→ Go to: TESTING_GUIDE.md
→ Read all sections
→ Learn troubleshooting
→ Master testing
→ Done in 30 minutes!
```

---

## 📊 Testing Roadmap

```
1. LOCAL TESTING (5 min)
   npm install → npm test → npm run ext:build
   ✅ All tests pass?
   
2. CHROME SETUP (5 min)
   chrome://extensions/ → Load unpacked
   ✅ Extension appears?
   
3. CHROME TESTING (5 min)
   mail.google.com → F12 → Console
   ✅ Tests pass?
   
4. BRAVE TESTING (5 min)
   brave://extensions/ → Load unpacked
   ✅ All tests pass?
   
5. SETTINGS TESTING (5 min)
   Right-click icon → Options
   ✅ UI works?

🎉 COMPLETE!
```

---

## 🎯 Final Checklist

Before considering testing done:

- [ ] Read one of the testing documents
- [ ] Run `npm install && npm run test`
- [ ] See all 27 tests pass ✅
- [ ] Load extension in Chrome via `chrome://extensions/`
- [ ] Test on Gmail via console message
- [ ] Test phishing detection (should give score 50+)
- [ ] Test legitimate email (should give score 0)
- [ ] Load extension in Brave
- [ ] Verify same tests pass in Brave
- [ ] Open settings page
- [ ] All above show ✅

**When complete: Extension is working correctly! 🚀**

---

## 💡 Pro Tips

1. **Keep terminal open** while testing - useful for logs
2. **Hard refresh** browser if changes don't show (Ctrl+Shift+R)
3. **Reload extension** in chrome://extensions/ when rebuilding
4. **Use multiple email samples** for thorough testing
5. **Check console early** - most issues show there
6. **Keep settings page open** - helps understand what's happening

---

## 🆘 Quick Help

**Something not working?**

1. Check your terminal - any error messages?
2. Check DevTools Console (F12) - any red errors?
3. Read the [Troubleshooting Section](./TESTING_GUIDE.md#troubleshooting--debugging)
4. Try "Emergency Restart" in [TESTING_COMMANDS.md](./TESTING_COMMANDS.md#-emergency-restart)

**Still stuck?**

Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) - it has detailed explanations.

---

**Last Updated:** November 12, 2025
**Version:** MailGuard v1.0
**All Documents Created:** November 12, 2025

**Start testing now!** Pick a document above and begin. 🚀

