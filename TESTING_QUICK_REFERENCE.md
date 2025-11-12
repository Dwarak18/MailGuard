# MailGuard Testing - Quick Reference Card

Print this card or keep it in your browser tab while testing!

---

## 🚀 FASTEST WAY TO TEST (10 minutes)

### Terminal (One-Liner)
```bash
cd /Users/sampreetapalanisamy/Documents/MailGuard && \
npm install && npm run ext:build && npm run test
```

### Expected Output
```
✅ npm install - complete
✅ npm run ext:build - complete
PASS  tests/unit/heuristics.test.ts
Tests: 27 passed, 27 total ✅
```

### Browser (3 Steps)
```
1. chrome://extensions/
2. Developer mode ON → Load unpacked → dist/
3. mail.google.com → F12 → Paste console command
```

### Console Command (Copy & Paste)
```javascript
chrome.runtime.sendMessage({type:'analyze',email:{from:'phisher@evil.com',displayName:'Amazon Support',subject:'Verify your account immediately',links:['https://192.168.1.1/verify'],body:''},source:'gmail'},(r)=>{console.log('Score:',r.score,'Suspicious:',r.suspicious)})
```

### Expected Output
```
Score: 50 Suspicious: true ✅
```

---

## 📋 TESTING CHECKLIST

### Pre-Browser (Local)
- [ ] cd to project folder
- [ ] npm install
- [ ] npm run test (27/27 pass)
- [ ] npm run ext:build (dist/ created)

### Chrome Setup
- [ ] chrome://extensions/ open
- [ ] Developer mode ON
- [ ] Load unpacked → dist/ folder
- [ ] MailGuard appears ✅
- [ ] Enable toggle
- [ ] Pin to toolbar

### Chrome Testing
- [ ] mail.google.com
- [ ] F12 → Console
- [ ] See [MailGuard] message ✅
- [ ] Run phishing test (score 50+) ✅
- [ ] Run legitimate test (score 0) ✅

### Brave Testing
- [ ] brave://extensions/ open
- [ ] Repeat Chrome setup
- [ ] Repeat Chrome tests
- [ ] All pass ✅

### Success Criteria
- [ ] 27/27 tests pass locally
- [ ] Extension loads Chrome/Brave
- [ ] Phishing: score 50+
- [ ] Legitimate: score 0
- [ ] Storage works
- [ ] Settings page opens

---

## 🌐 KEY URLS

| What | URL |
|------|-----|
| Chrome Extensions | `chrome://extensions/` |
| Brave Extensions | `brave://extensions/` |
| Test Email | `mail.google.com` |
| DevTools | F12 or Cmd+Option+I |
| Backend | `http://localhost:3000` |
| Backend Health | `http://localhost:3000/health` |

---

## 💻 COMMON COMMANDS

```bash
# Build
npm run ext:build

# Test
npm run test

# Watch tests
npm run test:unit:watch

# Type check
npm run type-check

# Backend
npm run backend:dev

# Clean
npm run clean

# Full setup
npm run clean && npm install && npm run ext:build
```

---

## 🧪 QUICK TEST EMAILS

### Phishing #1 (@ Symbol)
```javascript
chrome.runtime.sendMessage({type:'analyze',email:{from:'evil@site.com',displayName:'Amazon',subject:'Verify',links:['https://evil.com@amazon.com/verify'],body:''},source:'gmail'},(r)=>{console.log('Score:',r.score,'Suspicious:',r.suspicious)})
```
Expected: `Score: 50+ Suspicious: true` ✅

### Phishing #2 (IP Address)
```javascript
chrome.runtime.sendMessage({type:'analyze',email:{from:'fake@bank.com',displayName:'Your Bank',subject:'Update payment',links:['https://192.168.1.1/update'],body:''},source:'gmail'},(r)=>{console.log('Score:',r.score,'Suspicious:',r.suspicious)})
```
Expected: `Score: 50+ Suspicious: true` ✅

### Legitimate
```javascript
chrome.runtime.sendMessage({type:'analyze',email:{from:'john@company.com',displayName:'John Doe',subject:'Meeting notes',links:['https://company.sharepoint.com/docs'],body:''},source:'gmail'},(r)=>{console.log('Score:',r.score,'Suspicious:',r.suspicious)})
```
Expected: `Score: 0 Suspicious: false` ✅

---

## 🔧 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| No [MailGuard] in console | Reload: Ctrl+Shift+R or Reload extension |
| Extension won't load | npm run ext:build, then reload in extensions |
| Tests failing | npm run clean && npm install && npm run test |
| Response undefined | Check extension enabled, hard refresh |
| Build errors | npm run type-check (check errors), npm run lint |

---

## 📚 FULL GUIDES

| Time | Document |
|------|----------|
| 2 min | [START_HERE](./TESTING_START_HERE.md) |
| 5 min | [CHECKLIST](./TESTING_CHECKLIST.md) |
| 10 min | [COMMANDS](./TESTING_COMMANDS.md) |
| 20 min | [VISUAL](./BROWSER_TESTING_VISUAL.md) |
| 30 min | [GUIDE](./TESTING_GUIDE.md) |

---

## 🎯 SUCCESS PATH

```
1. Run npm commands ✅
2. Load in Chrome ✅
3. Test on Gmail ✅
4. All green ✅
🎉 Done!
```

---

## 📊 SCORING REFERENCE

| Score | Meaning | Color |
|-------|---------|-------|
| 0-34 | ✅ Legitimate | 🟢 Green |
| 35-65 | ⚠️ Suspicious | 🟡 Yellow |
| 66-100 | 🚨 Phishing | 🔴 Red |

---

## 🔑 KEY HEURISTICS

| Issue | Points | Example |
|-------|--------|---------|
| Display Name Mismatch | +25 | "Amazon Support" from phisher@evil.com |
| Suspicious URL | +15 | https://192.168.1.1/verify |
| URL @ Symbol | +15 | https://evil@amazon.com/verify |
| URL Encoding | +15 | https://site.com/path%2Fpassword |
| Long URL Path | +15 | https://site.com/a/b/c/...(>100 chars) |
| Urgency Keywords | +10 | "verify account", "confirm password" |

---

## ✨ WHAT WORKS

- ✅ Gmail detection
- ✅ Outlook detection (support ready)
- ✅ Local analysis (offline)
- ✅ Privacy-first design
- ✅ 27 unit tests (100% passing)
- ✅ Chrome & Brave support
- ✅ Storage & settings
- ✅ Report functionality

---

## 🚀 NEXT STEPS AFTER TESTING

1. **Deploy Backend:** `npm run backend:dev`
2. **Enable Cloud Analysis:** Toggle in settings
3. **Real Gmail Testing:** Try with actual emails
4. **Outlook Testing:** Switch to Outlook
5. **Firefox Support:** Add Firefox adapter
6. **Chrome Web Store:** Submit extension

---

## 📞 SUPPORT

- **Questions?** Read [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Stuck?** Check [TESTING_COMMANDS.md](./TESTING_COMMANDS.md#-troubleshooting)
- **Need help?** See [QUICKSTART.md](./QUICKSTART.md)
- **Architecture?** Read [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

**Print this page and keep it open while testing!**

**Created:** November 12, 2025
**Version:** MailGuard v1.0

