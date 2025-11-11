/**
 * Gmail Content Script Adapter
 * Extracts email data from Gmail DOM and injects warning banner
 */

import { AnalysisRequest, EmailData } from '../background/worker';

const GMAIL_SELECTORS = {
  emailContainer: '[role="presentation"]',
  emailHeader: '.gE',
  senderName: '.gD', // Display name
  senderEmail: '.g3', // Email address
  subject: '[data-subject]',
  messageBody: '[role="main"]',
  links: 'a[href^="http"]',
  attachments: '.aQu',
};

let currentEmailData: EmailData | null = null;

/**
 * Extract email data from Gmail's DOM
 */
function extractGmailEmailData(): EmailData | null {
  try {
    // Get the currently visible email container
    const emailElement = document.querySelector(GMAIL_SELECTORS.emailContainer);
    if (!emailElement) return null;

    // Extract sender info
    const senderElement = emailElement.querySelector(GMAIL_SELECTORS.senderName);

    // Extract subject
    const subjectElement = document.querySelector(GMAIL_SELECTORS.subject);
    const subject = subjectElement?.getAttribute('data-subject') || '';

    // Extract all links
    const links: string[] = [];
    const linkElements = emailElement.querySelectorAll(GMAIL_SELECTORS.links);
    linkElements.forEach((el) => {
      const href = el.getAttribute('href');
      if (href && href.startsWith('http')) {
        links.push(href);
      }
    });

    // Extract display name and email
    let displayName = '';
    let from = '';

    // Gmail shows sender in format: "Name <email@domain.com>"
    const senderText = senderElement?.textContent || '';
    const match = senderText.match(/^(.+?)\s*<(.+?)>$/);

    if (match) {
      displayName = match[1].trim();
      from = match[2].trim();
    } else {
      // Fallback: assume it's just email
      from = senderText.trim();
    }

    // Extract attachments count
    const attachments = Array.from(
      emailElement.querySelectorAll(GMAIL_SELECTORS.attachments)
    ).map((el) => el.textContent || '');

    if (!from) {
      console.warn('[MailGuard] Could not extract sender email');
      return null;
    }

    return {
      from,
      displayName,
      subject,
      links,
      attachments: attachments.length > 0 ? attachments : undefined,
      // Note: body is NOT extracted by default (privacy-first)
    };
  } catch (error) {
    console.error('[MailGuard] Error extracting Gmail data:', error);
    return null;
  }
}

/**
 * Inject warning banner into Gmail message
 */
function injectGmailBanner(reasons: string[], score: number): void {
  try {
    const mainContent = document.querySelector('[role="main"]');
    if (!mainContent) return;

    // Check if banner already exists
    if (document.getElementById('mailguard-banner')) {
      return;
    }

    // Create banner element
    const banner = createBanner(reasons, score);
    banner.id = 'mailguard-banner';

    // Insert at top of message
    const firstChild = mainContent.firstChild;
    if (firstChild) {
      mainContent.insertBefore(banner, firstChild);
    } else {
      mainContent.appendChild(banner);
    }

    // Add dismiss listener
    const dismissBtn = banner.querySelector('#mailguard-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        banner.remove();
      });
    }
  } catch (error) {
    console.error('[MailGuard] Error injecting banner:', error);
  }
}

/**
 * Create banner DOM element
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
 * Monitor for new email opens and analyze them
 */
function setupEmailMonitoring(): void {
  // Use MutationObserver to detect when a new email is opened
  const observer = new MutationObserver(() => {
    const emailData = extractGmailEmailData();

    if (emailData && emailData.from !== currentEmailData?.from) {
      currentEmailData = emailData;

      // Remove previous banner
      const oldBanner = document.getElementById('mailguard-banner');
      if (oldBanner) {
        oldBanner.remove();
      }

      // Send analysis request to background worker
      chrome.runtime.sendMessage(
        {
          type: 'analyze',
          email: emailData,
          source: 'gmail',
        } as AnalysisRequest,
        (response) => {
          if (response && response.suspicious) {
            injectGmailBanner(response.reasons, response.score);
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

// Start monitoring when content script loads
document.addEventListener('DOMContentLoaded', () => {
  setupEmailMonitoring();
});

// Fallback for already-loaded pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEmailMonitoring);
} else {
  setupEmailMonitoring();
}

console.log('[MailGuard] Gmail content script loaded');
