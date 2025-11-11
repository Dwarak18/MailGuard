// Generate a simple ID function since we're avoiding external dependencies
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Background Service Worker for MailGuard
 * Handles: storage, user preferences, message routing, reporting
 */

// Message types
export interface AnalysisRequest {
  type: 'analyze';
  email: EmailData;
  source: 'gmail' | 'outlook' | 'yahoo';
}

export interface EmailData {
  id?: string;
  from: string;
  displayName?: string;
  to?: string;
  subject: string;
  links: string[];
  attachments?: string[];
  body?: string; // Only with opt-in
}

export interface AnalysisResult {
  suspicious: boolean;
  score: number; // 0-100
  reasons: string[];
  source: 'local' | 'backend';
}

// Initialize extension storage
chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    cloudAnalysisEnabled: false,
    whitelistedSenders: [] as string[],
    blockedSenders: [] as string[],
    reportCount: 0,
    privacyConsent: false,
  };

  const existing = await chrome.storage.sync.get(Object.keys(defaults));
  const toStore = Object.entries(defaults).reduce((acc, [key, val]) => {
    if (!(key in existing)) {
      acc[key] = val;
    }
    return acc;
  }, {} as Record<string, any>);

  if (Object.keys(toStore).length > 0) {
    await chrome.storage.sync.set(toStore);
  }
});

// Handle incoming messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'analyze') {
    handleAnalyze(message as AnalysisRequest)
      .then(sendResponse)
      .catch((err) => {
        console.error('Analysis error:', err);
        sendResponse({ error: err.message });
      });
    return true; // Keep the message channel open for async response
  }

  if (message.type === 'report') {
    handleReport(message.email, sender.url)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'whitelist') {
    handleWhitelist(message.sender)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

async function handleAnalyze(request: AnalysisRequest): Promise<AnalysisResult> {
  const { email } = request;

  // Always run local heuristics
  const localResult = analyzeLocal(email);

  // Check cloud analysis preference
  await chrome.storage.sync.get(['cloudAnalysisEnabled']);

  // For MVP, just return local analysis
  // In production with backend, would call: await analyzeCloud(email)
  return {
    ...localResult,
    source: 'local',
  };
}

function analyzeLocal(email: EmailData): Omit<AnalysisResult, 'source'> {
  const reasons: string[] = [];
  let score = 0;

  // Check for display name mismatch
  if (email.displayName && email.from) {
    const displayNameLower = email.displayName.toLowerCase();
    const fromLower = email.from.toLowerCase();

    if (!fromLower.includes(displayNameLower.split(' ')[0])) {
      reasons.push(
        `Display name "${email.displayName}" doesn't match sender address "${email.from}"`
      );
      score += 25;
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

  // Check for urgency keywords
  const urgencyIssues = checkUrgencyKeywords(
    `${email.subject} ${email.body || ''}`
  );
  if (urgencyIssues.length > 0) {
    reasons.push(...urgencyIssues);
    score += 10;
  }

  return {
    suspicious: score >= 35,
    score: Math.min(score, 100),
    reasons,
  };
}

function checkSuspiciousUrl(url: string): string[] {
  const issues: string[] = [];

  try {
    const urlObj = new URL(url);

    // Check for @ symbol (can be used to obfuscate)
    if (urlObj.href.includes('@')) {
      issues.push(`URL contains @ symbol (obfuscation attempt): ${url}`);
    }

    // Check for IP address instead of domain
    if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url)) {
      issues.push(`URL uses IP address instead of domain: ${url}`);
    }

    // Check for very long path
    if (urlObj.pathname.length > 100) {
      issues.push(`URL has unusually long path: ${url}`);
    }

    // Check for encoded characters
    if (/%[0-9A-Fa-f]{2}/.test(urlObj.pathname)) {
      issues.push(`URL contains encoded characters: ${url}`);
    }
  } catch {
    // Invalid URL format itself is suspicious
    issues.push(`Invalid URL format: ${url}`);
  }

  return issues;
}

function checkUrgencyKeywords(text: string): string[] {
  const issues: string[] = [];
  const urgencyPatterns = [
    /verify.*account/i,
    /confirm.*password/i,
    /urgent.*action.*required/i,
    /click.*immediately/i,
    /account.*suspend/i,
    /unauthorized.*activity/i,
    /update.*payment/i,
  ];

  for (const pattern of urgencyPatterns) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      issues.push(`Contains urgency trigger: "${match?.[0]}"`);
    }
  }

  return issues;
}

async function handleReport(email: EmailData, tabUrl?: string): Promise<void> {
  // Check privacy consent before sending data
  const prefs = await chrome.storage.sync.get(['privacyConsent']);

  if (!prefs.privacyConsent) {
    throw new Error(
      'Privacy consent required. Show opt-in modal before reporting.'
    );
  }

  // Log report (in production, would send to backend)
  const report = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    from: email.from,
    subject: email.subject,
    tabUrl,
    // Do NOT include full email body unless explicitly requested
  };

  console.log('[MailGuard] Report:', report);

  // Increment report count
  const current = await chrome.storage.sync.get(['reportCount']);
  await chrome.storage.sync.set({
    reportCount: (current.reportCount || 0) + 1,
  });
}

async function handleWhitelist(sender: string): Promise<void> {
  const current = await chrome.storage.sync.get(['whitelistedSenders']);
  const list = current.whitelistedSenders || [];

  if (!list.includes(sender)) {
    list.push(sender);
    await chrome.storage.sync.set({ whitelistedSenders: list });
  }
}
