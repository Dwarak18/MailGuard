# MailGuard: Privacy-First Phishing Detection Extension

A Manifest V3 browser extension for Chrome and Firefox that detects suspicious and phishing emails inside Gmail, Outlook Web, and Yahoo Mail using local heuristics and optional cloud analysis.

## 🎯 Features

- **Local-first heuristics**: Display name mismatch, suspicious URLs, urgency keywords
- **Privacy-focused**: No data sent to backend by default; opt-in required for cloud analysis
- **User-friendly warnings**: Clear banner with reasons and action buttons
- **Cross-browser**: Chrome and Firefox support via Manifest V3
- **Whitelist management**: Skip warnings for trusted senders

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

```bash
# Install dependencies
npm install

# Build extension (dev mode with hot reload)
npm run dev

# Build for production
npm run build

# Run tests
npm run test
npm run test:e2e

# Build backend
npm run backend:build
npm run backend:start
```

### Loading into Browser

**Chrome:**
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `dist/` folder

**Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `dist/manifest.json`

## 📁 Project Structure

```
.
├── extension/                 # Browser extension source
│   ├── src/
│   │   ├── manifest.json     # Manifest V3 config
│   │   ├── background/       # Service worker
│   │   ├── content/          # Content scripts (Gmail, Outlook adapters)
│   │   ├── ui/               # React banner & options components
│   │   ├── heuristics/       # Core analysis logic
│   │   └── utils/            # Shared utilities
│   ├── public/               # Static assets
│   └── vite.config.ts        # Vite build config
│
├── backend/                  # Node.js/Express analysis API
│   ├── src/
│   │   ├── routes/           # /api/analyze endpoint
│   │   ├── ml/               # ML models (future)
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
│
├── tests/
│   ├── unit/                 # Jest tests for heuristics
│   ├── e2e/                  # Playwright tests
│   └── fixtures/             # Test data & mocks
│
└── .github/workflows/        # CI/CD (GitHub Actions)
```

## 🔒 Security & Privacy

- **No email content sent** by default; heuristics run locally
- **Explicit opt-in** before cloud analysis or reporting
- **Clear privacy policy** included
- **User controls**: Option to uninstall and clear all data

## 📝 Documentation

- [Privacy Policy](./docs/PRIVACY.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing](./CONTRIBUTING.md)

## 📦 Branches & Releases

- `main`: Production-ready releases
- `mvp/heuristics`: MVP with local heuristics only
- `backend/api`: Backend API integration
- `dev`: Development branch

## 📄 License

MIT - See LICENSE file

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
