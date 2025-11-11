# Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Chrome or Firefox browser
- Git

## Local Development

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/mailguard.git
cd mailguard
npm install
```

### 2. Development Build

```bash
# Terminal 1: Build extension (watch mode)
npm run ext:dev

# Terminal 2: Run backend API
npm run backend:dev

# Terminal 3: Run tests
npm run test:watch
```

The extension will be built to `extension/dist/`.

### 3. Load Extension in Chrome

1. Open `chrome://extensions/`
2. Toggle "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `extension/dist/` folder
5. Extension is now active!

### 4. Test on Gmail

1. Open https://mail.google.com
2. Open any email
3. Console should show: `[MailGuard] Gmail content script loaded`
4. Try with a test email (see fixtures)

## Browser Store Releases

### Chrome Web Store

1. **Prepare:**
   ```bash
   npm run build
   cd extension
   zip -r ../mailguard-chrome.zip dist/
   ```

2. **Upload:**
   - Go to https://chrome.google.com/webstore/developer/dashboard
   - Click "New Item"
   - Upload `mailguard-chrome.zip`
   - Fill metadata:
     - Name: "MailGuard - Phishing Detection"
     - Description: "Privacy-first detection of phishing emails in Gmail and Outlook"
     - Category: "Productivity"
     - Content Rating: Check the boxes for appropriate audience
   - Add screenshots (1280x800):
     - Screenshot 1: Gmail with warning banner
     - Screenshot 2: Options page
   - Add small promo tile (440x280):
     - Logo + text

3. **Privacy & Permissions:**
   - Declare: No external requests by default, opt-in cloud analysis
   - Declare: No tracking or analytics without consent
   - Link to privacy policy

4. **Review & Publish:**
   - Submit for review (~3-5 business days)
   - Google will check:
     - Permissions justified
     - No malware/suspicious behavior
     - Privacy policy complies
   - Once approved, goes live

5. **Update Process:**
   ```bash
   npm run build
   # Increment version in extension/src/manifest.json
   # Create new zip
   # Upload new version to dashboard
   # Publish (instant update to users)
   ```

### Firefox Add-ons

1. **Prepare:**
   ```bash
   npm run build
   cd extension/dist
   zip -r ../../mailguard-firefox.zip .
   ```

2. **Sign with Mozilla:**
   - Install `web-ext` CLI:
     ```bash
     npm install -g web-ext
     ```
   - Get API credentials:
     - https://addons.mozilla.org/developers/api/keys
   - Sign the package:
     ```bash
     web-ext sign \
       --api-key=$AMO_API_KEY \
       --api-secret=$AMO_API_SECRET \
       --source-dir=extension/dist
     ```

3. **Upload to Firefox Add-ons:**
   - Go to https://addons.mozilla.org/en-US/developers/
   - Click "Submit a New Add-on"
   - Upload signed `mailguard-firefox.xpi`
   - Fill metadata (similar to Chrome)
   - Add version history & release notes

4. **Review & Approval:**
   - Mozilla reviews for security/privacy
   - Usually 1-3 days
   - Approved → Listed on addons.mozilla.org

## Backend Deployment

### Docker

```bash
# Build image
docker build -t mailguard-api:latest backend/

# Run container
docker run -p 3000:3000 mailguard-api:latest

# Test
curl http://localhost:3000/health
```

### Cloud Platforms

#### AWS EC2

```bash
# SSH into instance
ssh -i key.pem ubuntu@your-instance.com

# Clone repo
git clone https://github.com/yourusername/mailguard.git
cd mailguard

# Build & start
npm install
npm run backend:build
npm run backend:start

# Use PM2 for persistence
npm install -g pm2
pm2 start backend/dist/server.js --name mailguard-api
pm2 save
```

#### Heroku

```bash
# Login
heroku login

# Create app
heroku create mailguard-api

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### Docker + AWS ECS/Google Cloud Run

```bash
# Build & push to registry
docker build -t mailguard-api:latest backend/
docker tag mailguard-api:latest gcr.io/YOUR_PROJECT/mailguard-api:latest
docker push gcr.io/YOUR_PROJECT/mailguard-api:latest

# Deploy with Cloud Run
gcloud run deploy mailguard-api \
  --image gcr.io/YOUR_PROJECT/mailguard-api:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Environment Variables

```bash
# .env file
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
ML_MODEL_PATH=/models/distilbert
```

## Testing Before Release

### Unit Tests

```bash
npm run test:unit
npm run test:heuristics
```

Expected output:
```
✓ URL Heuristics (8 tests)
✓ Display Name Heuristics (6 tests)
✓ Urgency Keywords Detection (9 tests)
✓ Integration Tests (4 tests)

PASS  tests/unit/heuristics.test.ts (2.5s)

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Coverage:    > 85%
```

### E2E Tests

```bash
npm run test:e2e
```

Tests include:
- Load Gmail test page
- Simulate phishing email
- Assert banner renders
- Click "Report" button
- Verify backend receives report

### Manual Testing Checklist

- [ ] Load in Chrome (incognito mode, no other extensions)
- [ ] Load in Firefox
- [ ] Test on real Gmail account (with test email)
- [ ] Test on Outlook Web (outlook.live.com)
- [ ] Test "Dismiss" button
- [ ] Test "Report" button (check privacy dialog)
- [ ] Enable cloud analysis in settings
- [ ] Verify no errors in console
- [ ] Check extension works after browser restart

## Monitoring & Analytics

### Backend Monitoring

```bash
# Check health endpoint
curl https://api.mailguard.dev/health

# Logs should show:
# [2024-01-10T10:30:45] POST /api/analyze
# [2024-01-10T10:30:46] 200 - 1.2s
```

### User Metrics to Track

- Daily active users (DAU)
- Emails analyzed (daily)
- Phishing detection accuracy
- False positive rate
- Reports submitted
- Cloud analysis adoption rate

### Error Tracking

Use Sentry or similar:

```typescript
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "https://key@sentry.io/project",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

## Update Strategy

### Rolling Updates

1. Deploy new backend version
2. Old clients continue working (backward compatible)
3. Gradually roll out to 10% → 50% → 100% of users
4. Monitor error rates after each stage

### Breaking Changes

If DB schema changes:
1. Deploy migration script
2. Update backend code
3. Test on staging
4. Deploy to production (during low-traffic window)
5. Update clients with new feature flag

### Rollback Plan

```bash
# If deployment fails
git revert HEAD
npm run backend:build
npm run backend:start

# Or use Docker
docker run -p 3000:3000 mailguard-api:v0.0.5
```

## Security Checklist

Before production release:

- [ ] Enable HTTPS/TLS everywhere
- [ ] Set secure HTTP headers (HSTS, CSP, etc.)
- [ ] Validate all user inputs
- [ ] Sanitize error messages (no sensitive data leaks)
- [ ] Use environment variables for secrets (not in code)
- [ ] Enable rate limiting on API endpoints
- [ ] Add request logging & monitoring
- [ ] Regular security audits
- [ ] Penetration testing before launch
- [ ] Privacy policy reviewed by legal
- [ ] No hardcoded API keys or credentials

## Continuous Integration

### GitHub Actions

File: `.github/workflows/build.yml`

```yaml
name: Build & Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: extension/dist/
```

## Support & Feedback

- **GitHub Issues:** Bug reports and feature requests
- **Email:** support@mailguard.dev
- **Twitter:** @mailguard_dev
- **Discord Community:** (if applicable)

---

**Ready to deploy?** Let's go! 🚀
