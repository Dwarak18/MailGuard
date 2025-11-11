import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

/**
 * POST /api/analyze
 * Analyze email content for phishing/suspicious characteristics
 *
 * Request body:
 * {
 *   "from": "sender@example.com",
 *   "displayName": "Sender Name",
 *   "subject": "Email Subject",
 *   "links": ["https://example.com/link1", "https://example.com/link2"],
 *   "body": "Email body text (only if user opted in)"
 * }
 *
 * Response:
 * {
 *   "id": "uuid",
 *   "suspicious": true,
 *   "score": 75,
 *   "reasons": [
 *     "Display name mismatch",
 *     "Suspicious URL pattern detected"
 *   ],
 *   "model": "heuristics-v1"
 * }
 */
app.post('/api/analyze', (req: Request, res: Response) => {
  try {
    const { from, displayName, subject, links, body } = req.body;

    if (!from || !subject) {
      return res.status(400).json({
        error: 'Missing required fields: from, subject',
      });
    }

    // For MVP: Run server-side heuristics
    // In production: would use ML models (DistilBERT, XGBoost)
    const analysisResult = analyzeEmail({
      from,
      displayName,
      subject,
      links,
      body,
    });

    res.json({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      ...analysisResult,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/report
 * Log a reported phishing email for training
 */
app.post('/api/report', (req: Request, res: Response) => {
  try {
    const { from, subject, reason } = req.body;

    if (!from || !subject) {
      return res.status(400).json({
        error: 'Missing required fields: from, subject',
      });
    }

    // Log for model training and analytics
    const report = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      from,
      subject,
      reason,
    };

    console.log('[Report]', report);

    res.json({
      id: report.id,
      status: 'received',
      message: 'Thank you for reporting. This helps improve phishing detection.',
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats
 * Get aggregated statistics (admin endpoint)
 */
app.get('/api/stats', (_req: Request, res: Response) => {
  // In production: query analytics database
  res.json({
    reportsReceived: 0,
    accuracyScore: 0,
    modelsAvailable: ['heuristics-v1'],
  });
});

// ============================================
// Local analysis function
// ============================================

interface EmailForAnalysis {
  from: string;
  displayName?: string;
  subject: string;
  links?: string[];
  body?: string;
}

interface AnalysisOutput {
  suspicious: boolean;
  score: number;
  reasons: string[];
  model: string;
}

function analyzeEmail(email: EmailForAnalysis): AnalysisOutput {
  const reasons: string[] = [];
  let score = 0;

  // Check for display name mismatch
  if (email.displayName && email.from) {
    const displayNameLower = email.displayName.toLowerCase();
    const emailLocal = email.from.split('@')[0].toLowerCase();

    if (!displayNameLower.includes(emailLocal) && !emailLocal.includes(displayNameLower)) {
      reasons.push(
        `Display name mismatch: "${email.displayName}" vs "${email.from}"`
      );
      score += 20;
    }
  }

  // Check for suspicious URLs
  if (email.links && email.links.length > 0) {
    for (const link of email.links) {
      const urlIssues = checkSuspiciousUrl(link);
      if (urlIssues) {
        reasons.push(...urlIssues);
        score += 15;
      }
    }
  }

  // Check subject for urgency keywords
  const subjectIssues = checkUrgencyKeywords(email.subject);
  if (subjectIssues.length > 0) {
    reasons.push(...subjectIssues);
    score += 10;
  }

  // Check body if provided
  if (email.body) {
    const bodyIssues = checkUrgencyKeywords(email.body);
    if (bodyIssues.length > 0) {
      reasons.push(...bodyIssues);
      score += 5;
    }
  }

  return {
    suspicious: score >= 35,
    score: Math.min(score, 100),
    reasons,
    model: 'heuristics-v1',
  };
}

function checkSuspiciousUrl(url: string): string[] {
  const issues: string[] = [];

  try {
    const urlObj = new URL(url);

    if (urlObj.href.includes('@')) {
      issues.push(`URL contains @ symbol: ${url}`);
    }

    if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url)) {
      issues.push(`URL uses IP address: ${url}`);
    }

    if (urlObj.pathname.length > 100) {
      issues.push(`URL has unusually long path: ${url}`);
    }
  } catch {
    issues.push(`Invalid URL format: ${url}`);
  }

  return issues;
}

function checkUrgencyKeywords(text: string): string[] {
  const issues: string[] = [];
  const patterns = [
    { regex: /verify.*account|confirm.*account/i, text: 'Account verification request' },
    { regex: /confirm.*password|reset.*password/i, text: 'Password confirmation request' },
    { regex: /urgent.*action|action.*required/i, text: 'Urgency trigger detected' },
    { regex: /click.*immediately|act.*now/i, text: 'Immediate action pressure' },
    { regex: /account.*suspend|account.*locked/i, text: 'Account suspension threat' },
    { regex: /unauthorized.*access|suspicious.*activity/i, text: 'Security threat claim' },
    { regex: /update.*payment|confirm.*payment/i, text: 'Payment update request' },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(text)) {
      issues.push(pattern.text);
    }
  }

  return issues;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MailGuard API server running on port ${PORT}`);
  console.log(`📝 POST /api/analyze - Analyze email`);
  console.log(`📧 POST /api/report - Report phishing email`);
  console.log(`📊 GET /api/stats - Get statistics`);
  console.log(`💚 GET /health - Health check`);
});
