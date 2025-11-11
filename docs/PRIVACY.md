# MailGuard Security & Privacy Policy

**Last Updated:** November 2025

## Overview

MailGuard is a browser extension designed to detect suspicious and phishing emails while prioritizing user privacy. This policy explains how MailGuard collects, uses, and protects your data.

## Key Privacy Principles

1. **Privacy by Default**: MailGuard runs entirely locally with zero backend calls by default
2. **No Tracking**: We do not track user browsing habits
3. **User Control**: You explicitly opt-in before any data is sent to our servers
4. **No Email Storage**: Email content is never permanently stored without your consent

## Data We Collect

### Local Analysis (Always On)
- Email sender address
- Email subject line
- Email display name
- Links in the email
- Attachment count (name not stored)

**Why?** To perform heuristic analysis for phishing detection locally on your device.

**Where?** Only stored temporarily in memory during analysis. Not persisted unless you enable cloud analysis.

### Cloud Analysis (Opt-in Only)
If you enable cloud analysis, we may send:
- Email metadata (from, subject, links, body if explicitly approved)
- Analysis results from your device
- Timestamp of analysis

**Why?** To improve our ML models and provide more accurate detection.

**What we DON'T send:**
- Your email password
- Authentication tokens
- Full email conversations
- Attachments

## User Preferences

We store locally (Chrome/Firefox sync storage):
- Cloud analysis preference (enabled/disabled)
- Whitelist of trusted senders
- Report count (for analytics)
- Privacy consent status

These are stored on your device only and are not sent to our servers unless you explicitly report an email or enable cloud analysis.

## Reporting

When you click "Report Phishing":
1. A dialog will ask for your explicit consent
2. We will send: sender email, subject, link to our backend
3. We will NOT send email body unless you explicitly approve
4. Reports are used to improve detection and train models
5. You can clear this data at any time

## Third Parties

MailGuard does not share your data with third parties, except:
- **Browser vendors** (Chrome, Mozilla) for extension distribution
- **Cloud hosting** provider for our backend API (transparent infrastructure)

We do not sell or rent user data.

## Deletion & Control

You have full control:

1. **Stop Analysis**: Disable the extension anytime
2. **Clear Data**: Use "Clear All Data" button in settings
3. **Uninstall**: Remove the extension; all local data is deleted
4. **Delete Reports**: Request report deletion by contacting support

## Security

- All communications use HTTPS/TLS encryption
- No unencrypted data transmission
- Security headers enabled (HSTS, CSP)
- Regular security audits

## Contact & Support

For privacy inquiries:
- Email: privacy@mailguard.dev
- GitHub Issues: https://github.com/yourusername/mailguard/issues

## Changes to This Policy

We will notify users of material changes. Continued use of MailGuard after changes constitutes acceptance of the new policy.

---

**MailGuard is committed to respecting your privacy. Our code is open-source for transparency.**
