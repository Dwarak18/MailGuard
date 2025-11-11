/**
 * Unit tests for heuristic detection functions
 * Run with: npm run test:heuristics
 */

import { describe, it, expect } from '@jest/globals';

// Import the heuristics from the background worker
// For testing, we'll re-implement the heuristics here
// In production, we'd export these from a shared module

function checkSuspiciousUrl(url: string): string[] {
  const issues: string[] = [];

  try {
    const urlObj = new URL(url);

    if (urlObj.href.includes('@')) {
      issues.push(`URL contains @ symbol (obfuscation attempt): ${url}`);
    }

    if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url)) {
      issues.push(`URL uses IP address instead of domain: ${url}`);
    }

    if (urlObj.pathname.length > 100) {
      issues.push(`URL has unusually long path: ${url}`);
    }

    if (/%[0-9A-Fa-f]{2}/.test(urlObj.pathname)) {
      issues.push(`URL contains encoded characters: ${url}`);
    }
  } catch {
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

function checkDisplayNameMismatch(
  displayName: string | undefined,
  from: string
): string | null {
  if (!displayName || !from) return null;

  const displayNameLower = displayName.toLowerCase();
  const fromLower = from.toLowerCase();

  if (!fromLower.includes(displayNameLower.split(' ')[0])) {
    return `Display name "${displayName}" doesn't match sender address "${from}"`;
  }

  return null;
}

describe('URL Heuristics', () => {
  describe('Suspicious URL Detection', () => {
    it('should detect @ symbol in URL', () => {
      const url = 'https://evil.com@legitimate.com/path';
      const issues = checkSuspiciousUrl(url);
      expect(issues.some(issue => issue.includes('@'))).toBe(true);
    });

    it('should detect IP address instead of domain', () => {
      const url = 'https://192.168.1.1/phishing';
      const issues = checkSuspiciousUrl(url);
      expect(issues.some(issue => issue.includes('IP address'))).toBe(true);
    });

    it('should detect unusually long paths', () => {
      const longPath = 'a'.repeat(150);
      const url = `https://example.com/${longPath}`;
      const issues = checkSuspiciousUrl(url);
      expect(issues.some(issue => issue.includes('long path'))).toBe(true);
    });

    it('should detect URL-encoded characters', () => {
      const url = 'https://example.com/path%2Fwith%2Fencoded';
      const issues = checkSuspiciousUrl(url);
      expect(issues.some(issue => issue.includes('encoded'))).toBe(true);
    });

    it('should flag invalid URLs', () => {
      const url = 'not a valid url!';
      const issues = checkSuspiciousUrl(url);
      expect(issues.length).toBeGreaterThan(0);
    });

    it('should not flag legitimate URLs', () => {
      const url = 'https://github.com/legitimate/project';
      const issues = checkSuspiciousUrl(url);
      expect(issues.length).toBe(0);
    });

    it('should handle multiple issues in one URL', () => {
      const url = 'https://evil.com@legitimate.com/path%2Fencoded';
      const issues = checkSuspiciousUrl(url);
      expect(issues.length).toBeGreaterThan(1);
    });
  });
});

describe('Display Name Heuristics', () => {
  it('should detect mismatch: display name vs email', () => {
    const issue = checkDisplayNameMismatch('John Doe', 'hacker@phishing.com');
    expect(issue).toBeTruthy();
    expect(issue).toContain("doesn't match");
  });

  it('should not flag matching display name and email', () => {
    const issue = checkDisplayNameMismatch('John Doe', 'john.doe@company.com');
    expect(issue).toBeNull();
  });

  it('should not flag when display name is undefined', () => {
    const issue = checkDisplayNameMismatch(undefined, 'john@company.com');
    expect(issue).toBeNull();
  });

  it('should be case-insensitive', () => {
    const issue = checkDisplayNameMismatch('JOHN DOE', 'john@company.com');
    expect(issue).toBeNull();
  });

  it('should handle single-name display names', () => {
    const issue = checkDisplayNameMismatch('Amazon', 'support@amazon.com');
    expect(issue).toBeNull();
  });

  it('should flag impersonation attempts', () => {
    const issue = checkDisplayNameMismatch('Amazon Support', 'phisher@evil.com');
    expect(issue).toBeTruthy();
  });
});

describe('Urgency Keywords Detection', () => {
  it('should detect verify account triggers', () => {
    const text = 'Please verify your account immediately';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect confirm password triggers', () => {
    const text = 'Confirm your password now';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect account suspension threats', () => {
    const text = 'Your account has been suspended';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect urgent action required', () => {
    const text = 'Urgent action required immediately';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect unauthorized activity claims', () => {
    const text = 'Unauthorized activity detected on your account';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should not flag legitimate emails', () => {
    const text = 'Here is your monthly report for review';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBe(0);
  });

  it('should be case-insensitive', () => {
    const text = 'VERIFY YOUR ACCOUNT IMMEDIATELY';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBeGreaterThan(0);
  });

  it('should detect multiple triggers', () => {
    const text =
      'Urgent action required: verify your account and confirm your password immediately';
    const issues = checkUrgencyKeywords(text);
    expect(issues.length).toBeGreaterThan(1);
  });
});

describe('Integration Tests', () => {
  it('should correctly identify a phishing email', () => {
    const email = {
      from: 'phisher@evil.com',
      displayName: 'Amazon Support',
      subject: 'Verify your account immediately',
      links: ['https://192.168.1.1/verify'],
    };

    let score = 0;
    const reasons: string[] = [];

    // Check display name
    const displayIssue = checkDisplayNameMismatch(email.displayName, email.from);
    if (displayIssue) {
      reasons.push(displayIssue);
      score += 25;
    }

    // Check URLs
    for (const link of email.links) {
      const urlIssues = checkSuspiciousUrl(link);
      if (urlIssues.length > 0) {
        reasons.push(...urlIssues);
        score += 15;
      }
    }

    // Check subject
    const subjectIssues = checkUrgencyKeywords(email.subject);
    if (subjectIssues.length > 0) {
      reasons.push(...subjectIssues);
      score += 10;
    }

    expect(score).toBeGreaterThanOrEqual(35);
    expect(reasons.length).toBeGreaterThan(0);
  });

  it('should correctly identify a legitimate email', () => {
    const email = {
      from: 'john@company.com',
      displayName: 'John Doe',
      subject: 'Meeting notes from today',
      links: ['https://github.com/company/project'],
    };

    let score = 0;
    const reasons: string[] = [];

    // Check display name
    const displayIssue = checkDisplayNameMismatch(email.displayName, email.from);
    if (displayIssue) {
      reasons.push(displayIssue);
      score += 25;
    }

    // Check URLs
    for (const link of email.links) {
      const urlIssues = checkSuspiciousUrl(link);
      if (urlIssues.length > 0) {
        reasons.push(...urlIssues);
        score += 15;
      }
    }

    // Check subject
    const subjectIssues = checkUrgencyKeywords(email.subject);
    if (subjectIssues.length > 0) {
      reasons.push(...subjectIssues);
      score += 10;
    }

    expect(score).toBeLessThan(35);
    expect(reasons.length).toBe(0);
  });

  it('should detect a credit card phishing attempt', () => {
    const email = {
      from: 'support@not-bank.com',
      displayName: 'Your Bank',
      subject: 'Update your payment method urgently',
      links: ['https://192.168.0.1/update%2Fpayment'],
    };

    let score = 0;
    const reasons: string[] = [];

    const displayIssue = checkDisplayNameMismatch(email.displayName, email.from);
    if (displayIssue) {
      reasons.push(displayIssue);
      score += 25;
    }

    for (const link of email.links) {
      const urlIssues = checkSuspiciousUrl(link);
      if (urlIssues.length > 0) {
        reasons.push(...urlIssues);
        score += 15;
      }
    }

    const subjectIssues = checkUrgencyKeywords(email.subject);
    if (subjectIssues.length > 0) {
      reasons.push(...subjectIssues);
      score += 10;
    }

    expect(score).toBeGreaterThanOrEqual(35);
    expect(reasons.some((r) => r.includes('payment'))).toBe(true);
  });
});
