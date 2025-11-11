# Contributing to MailGuard

Thank you for your interest in contributing! This document provides guidelines and instructions.

## Code of Conduct

- Be respectful and inclusive
- No harassment, discrimination, or abuse
- Report issues to maintainers

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- A GitHub account

### Setup Development Environment

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/mailguard.git
cd mailguard

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/mailguard.git

# 4. Install dependencies
npm install

# 5. Create a feature branch
git checkout -b feature/your-feature-name
```

### Development Workflow

```bash
# Build and watch for changes
npm run ext:dev

# In another terminal, start backend
npm run backend:dev

# In another terminal, run tests
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Code Style

- Use TypeScript for type safety
- ESLint: `npm run lint`
- Prettier: `npm run format` (auto)
- No `console.log` (use `console.error` for errors)

### Testing

**Write tests for:**
- New heuristic functions
- Content script adapters
- Background worker message handlers
- React components

```bash
# Unit tests
npm run test:heuristics

# All tests with coverage
npm run test:unit

# E2E tests
npm run test:e2e
```

**Coverage threshold:** ≥70% for PRs

## Contribution Types

### 1. Bug Reports

Create an issue with:
- Clear title: `[BUG] Description`
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs
- Environment (OS, browser, version)

Example:
```
[BUG] Banner not appearing on Outlook Web

Steps:
1. Open outlook.office.com
2. Open any email with suspicious links
3. Banner should appear

Actual: No banner shown
Expected: Red warning banner visible
```

### 2. Feature Requests

Title: `[FEATURE] Description`

Include:
- Use case/problem statement
- Proposed solution
- Alternatives considered
- Does it involve data collection? (if yes, privacy impact assessment)

### 3. Code Contributions

#### Adding a New Heuristic

**File:** `extension/src/background/worker.ts`

```typescript
function checkNewHeuristic(email: EmailData): string[] {
  const issues: string[] = [];
  // Your logic
  return issues;
}

// In analyzeLocal():
const newIssues = checkNewHeuristic(email);
if (newIssues.length > 0) {
  reasons.push(...newIssues);
  score += 15; // Tune weight
}
```

**Test:** `tests/unit/heuristics.test.ts`

```typescript
describe('New Heuristic', () => {
  it('should detect specific pattern', () => {
    const result = checkNewHeuristic({...});
    expect(result).toContain(expect.stringContaining('pattern'));
  });

  it('should not flag benign case', () => {
    const result = checkNewHeuristic({...});
    expect(result.length).toBe(0);
  });
});
```

#### Adding Support for New Email Provider

**File:** `extension/src/content/yahoo.tsx`

```typescript
const YAHOO_SELECTORS = {
  emailContainer: '[role="presentation"]',
  senderName: '.sender-name',
  // ... other selectors
};

function extractYahooEmailData(): EmailData | null {
  // Similar to Gmail/Outlook adapters
}

function injectYahooBanner(reasons: string[], score: number): void {
  // Provider-specific DOM injection
}

function setupEmailMonitoring(): void {
  // Provider-specific monitoring
}
```

**Update manifest.json:**
```json
{
  "content_scripts": [
    // ...
    {
      "matches": ["https://mail.yahoo.com/*"],
      "js": ["content-yahoo.js"],
      "run_at": "document_start"
    }
  ]
}
```

#### Backend Improvements

**Example:** Adding ML model integration

File: `backend/src/ml/analyzer.ts`

```typescript
export async function analyzeWithML(email: EmailData): Promise<AnalysisResult> {
  // Load pre-trained model
  // Extract features from email
  // Run inference
  // Return results
}
```

**Test:** `tests/unit/ml.test.ts`

```typescript
describe('ML Analysis', () => {
  it('should detect phishing with high accuracy', () => {
    // Load test dataset
    // Run inference
    // Assert accuracy > 0.9
  });
});
```

## Pull Request Process

1. **Keep it focused:** One feature/fix per PR

2. **Update dependencies:**
   ```bash
   npm ci  # Ensure lock file updated
   ```

3. **Test locally:**
   ```bash
   npm run type-check
   npm run lint
   npm run test:unit
   npm run test:e2e
   npm run build
   ```

4. **Commit messages:**
   - Use conventional commits:
     - `feat: add new heuristic for...`
     - `fix: correct display name detection`
     - `docs: update architecture guide`
     - `test: add coverage for...`

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create PR on GitHub:**
   - Reference related issues: `Closes #123`
   - Describe changes & testing
   - Screenshots for UI changes

7. **Respond to review comments:**
   - Make requested changes
   - Push updates (force-push if needed)
   - Re-request review

### PR Checklist

- [ ] Tests added/updated
- [ ] No lint errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Changelog updated (if applicable)
- [ ] Privacy/security implications considered
- [ ] Documentation updated (if needed)
- [ ] Screenshot included (for UI changes)

## Branches

- `main` - Production releases (protected)
- `mvp/heuristics` - MVP with local heuristics only
- `backend/api` - Backend API work
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes

## Documentation

- Update README.md if user-facing changes
- Update ARCHITECTURE.md for system design changes
- Add code comments for non-obvious logic
- Link to related issues/PRs

## Performance & Security

### Performance

- Content script analysis: <50ms
- Heuristics check: <10ms
- Total banner display: <100ms
- Backend analysis: <500ms

### Security

- No hardcoded credentials
- Input validation on all endpoints
- Sanitize error messages
- Use HTTPS for all external calls
- Minimize permissions in manifest.json

## Getting Help

- **Questions:** Open a discussion or issue
- **Chat:** GitHub Discussions
- **Email:** contributors@mailguard.dev

## Recognition

Contributors will be listed in:
- CONTRIBUTORS.md
- Release notes
- GitHub contributors page

## License

By contributing, you agree your code is licensed under MIT.

---

**Thank you for making MailGuard better!** 🙏
