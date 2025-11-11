/**
 * Outlook Web Content Script Adapter
 * Extracts email data from Outlook DOM and injects warning banner
 */

import { AnalysisRequest, EmailData } from '../background/worker';

const OUTLOOK_SELECTORS = {
  emailContainer: '[role="presentation"] [data-is-focusable="true"]',
  senderDisplay: '[data-testid="senderDisplay"]',
  subject: '[data-testid="subject"]',
  messageBody: '[data-testid="message-body"]',
  links: 'a[href^="http"]',
};

let currentEmailData: EmailData | null = null;

/**
 * Extract email data from Outlook's DOM
 */
function extractOutlookEmailData(): EmailData | null {
  try {
    // Find the email container - Outlook Web has different DOM structure
    const emailItem = document.querySelector('[data-testid="mail-item"]');
    const mailPane = document.querySelector('[data-testid="mail-pane"]');
    const container = emailItem || mailPane;

    if (!container) return null;

    // Extract sender information
    const senderDisplay = container.querySelector(OUTLOOK_SELECTORS.senderDisplay);
    let displayName = '';
    let from = '';

    if (senderDisplay) {
      const senderText = senderDisplay.textContent || '';
      // Format can be: "Name (email@domain.com)" or just "email@domain.com"
      const match = senderText.match(/^(.+?)\s*\(?(.+?)@(.+?)\)?$/);

      if (match) {
        displayName = match[1].trim().replace(/\(/, '').replace(/\)/, '');
        from = match[2] + '@' + match[3];
      } else {
        from = senderText.trim();
      }
    }

    // Extract subject
    const subjectElement = container.querySelector(OUTLOOK_SELECTORS.subject);
    const subject = subjectElement?.textContent || '';

    // Extract body text (for keyword analysis)
    const bodyElement = container.querySelector(OUTLOOK_SELECTORS.messageBody);
    const bodyText = bodyElement?.textContent || '';

    // Extract all links
    const links: string[] = [];
    const linkElements = container.querySelectorAll(OUTLOOK_SELECTORS.links);
    linkElements.forEach((el) => {
      const href = el.getAttribute('href');
      if (href && href.startsWith('http')) {
        links.push(href);
      }
    });

    if (!from) {
      console.warn('[MailGuard] Could not extract sender email from Outlook');
      return null;
    }

    return {
      from,
      displayName,
      subject,
      links,
      body: bodyText, // Include for keyword analysis only
    };
  } catch (error) {
    console.error('[MailGuard] Error extracting Outlook data:', error);
    return null;
  }
}

/**
 * Inject warning banner into Outlook message
 */
function injectOutlookBanner(reasons: string[], score: number): void {
  try {
    // Outlook typically has a mail reading pane
    const readingPane = document.querySelector('[data-testid="mail-pane"]');
    if (!readingPane) return;

    // Check if banner already exists
    if (document.getElementById('mailguard-banner')) {
      return;
    }

    const banner = createBanner(reasons, score);
    banner.id = 'mailguard-banner';

    // Insert at the top of the reading pane
    const firstChild = readingPane.firstChild;
    if (firstChild) {
      readingPane.insertBefore(banner, firstChild);
    } else {
      readingPane.appendChild(banner);
    }

    // Add dismiss listener
    const dismissBtn = banner.querySelector('#mailguard-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        banner.remove();
      });
    }
  } catch (error) {
    console.error('[MailGuard] Error injecting Outlook banner:', error);
  }
}

/**
 * Create banner DOM element (shared style)
 */
function createBanner(reasons: string[], score: number): HTMLElement {
  const banner = document.createElement('div');
  banner.style.cssText = `
    padding: 12px 16px;
    margin: 12px 0;
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
    color: white;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    border-left: 4px solid #cc0000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
  `;

  const header = document.createElement('div');
  header.style.cssText = 'font-weight: 600; margin-bottom: 8px; font-size: 14px;';
  header.textContent = '⚠️ Suspicious Email Detected';

  const scoreBar = document.createElement('div');
  scoreBar.style.cssText = `
    font-size: 12px;
    margin: 8px 0;
    padding: 4px 0;
  `;
  scoreBar.textContent = `Risk Score: ${score}/100`;

  const reasonsList = document.createElement('ul');
  reasonsList.style.cssText = `
    margin: 8px 0;
    padding-left: 20px;
    font-size: 13px;
    line-height: 1.4;
  `;

  for (const reason of reasons) {
    const li = document.createElement('li');
    li.textContent = reason;
    li.style.marginBottom = '4px';
    reasonsList.appendChild(li);
  }

  const actions = document.createElement('div');
  actions.style.cssText = `
    margin-top: 12px;
    display: flex;
    gap: 8px;
    font-size: 12px;
  `;

  const ignoreBtn = document.createElement('button');
  ignoreBtn.id = 'mailguard-dismiss';
  ignoreBtn.textContent = 'Dismiss';
  ignoreBtn.style.cssText = `
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  `;
  ignoreBtn.onmouseover = () => {
    ignoreBtn.style.background = 'rgba(255, 255, 255, 0.4)';
  };
  ignoreBtn.onmouseout = () => {
    ignoreBtn.style.background = 'rgba(255, 255, 255, 0.25)';
  };

  const reportBtn = document.createElement('button');
  reportBtn.id = 'mailguard-report';
  reportBtn.textContent = 'Report Phishing';
  reportBtn.style.cssText = `
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(0, 0, 0, 0.3);
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  `;
  reportBtn.onmouseover = () => {
    reportBtn.style.background = 'rgba(0, 0, 0, 0.3)';
  };
  reportBtn.onmouseout = () => {
    reportBtn.style.background = 'rgba(0, 0, 0, 0.2)';
  };

  reportBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'report',
      email: currentEmailData,
    });
    alert('Thank you for reporting. We will review this email.');
  });

  actions.appendChild(ignoreBtn);
  actions.appendChild(reportBtn);

  banner.appendChild(header);
  banner.appendChild(scoreBar);
  banner.appendChild(reasonsList);
  banner.appendChild(actions);

  return banner;
}

/**
 * Monitor for new email opens
 */
function setupEmailMonitoring(): void {
  const observer = new MutationObserver(() => {
    const emailData = extractOutlookEmailData();

    if (emailData && emailData.from !== currentEmailData?.from) {
      currentEmailData = emailData;

      // Remove previous banner
      const oldBanner = document.getElementById('mailguard-banner');
      if (oldBanner) {
        oldBanner.remove();
      }

      // Send analysis request
      chrome.runtime.sendMessage(
        {
          type: 'analyze',
          email: emailData,
          source: 'outlook',
        } as AnalysisRequest,
        (response) => {
          if (response && response.suspicious) {
            injectOutlookBanner(response.reasons, response.score);
          }
        }
      );
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });
}

// Start monitoring
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEmailMonitoring);
} else {
  setupEmailMonitoring();
}

console.log('[MailGuard] Outlook content script loaded');
