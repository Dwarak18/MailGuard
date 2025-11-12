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
  
  // Determine severity level
  let severity = 'info';
  let iconEmoji = '💡';
  if (score >= 65) {
    severity = 'critical';
    iconEmoji = '🔴';
  } else if (score >= 35) {
    severity = 'warning';
    iconEmoji = '⚠️';
  }
  
  const bgGradient = severity === 'critical' 
    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)'
    : severity === 'warning'
    ? 'linear-gradient(135deg, #ffa502 0%, #ff7a02 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  const borderColor = severity === 'critical' 
    ? '#cc0000'
    : severity === 'warning'
    ? '#ff7a02'
    : '#667eea';

  banner.style.cssText = `
    padding: 20px 24px;
    margin: 16px 0;
    background: ${bgGradient};
    color: white;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    border-left: 5px solid ${borderColor};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideDown 0.4s ease-out;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  banner.appendChild(style);

  // Header with icon
  const header = document.createElement('div');
  header.style.cssText = `
    font-weight: 700;
    margin-bottom: 12px;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  const headerIcon = document.createElement('span');
  headerIcon.textContent = iconEmoji;
  headerIcon.style.cssText = 'font-size: 20px;';
  header.appendChild(headerIcon);
  const headerText = document.createElement('span');
  headerText.textContent = severity === 'critical' 
    ? 'HIGH RISK - Likely Phishing'
    : severity === 'warning'
    ? 'Suspicious Email Detected'
    : 'Email Analysis Complete';
  header.appendChild(headerText);

  // Score bar
  const scoreBar = document.createElement('div');
  scoreBar.style.cssText = `
    font-size: 13px;
    margin: 12px 0;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  const scoreLabel = document.createElement('span');
  scoreLabel.textContent = 'Risk Score:';
  scoreBar.appendChild(scoreLabel);
  
  const scoreValue = document.createElement('span');
  scoreValue.style.cssText = `
    font-weight: 700;
    font-size: 18px;
    min-width: 40px;
  `;
  scoreValue.textContent = `${score}`;
  scoreBar.appendChild(scoreValue);
  
  const scoreMax = document.createElement('span');
  scoreMax.textContent = '/ 100';
  scoreBar.appendChild(scoreMax);

  // Visual score bar
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.25);
    border-radius: 3px;
    margin-top: 8px;
    overflow: hidden;
  `;
  const progress = document.createElement('div');
  progress.style.cssText = `
    height: 100%;
    width: ${Math.min(score, 100)}%;
    background: white;
    border-radius: 3px;
    transition: width 0.5s ease;
  `;
  progressBar.appendChild(progress);
  scoreBar.appendChild(progressBar);

  // Reasons list
  const reasonsList = document.createElement('div');
  reasonsList.style.cssText = `
    margin: 16px 0 0;
    padding: 0;
    font-size: 13px;
    line-height: 1.6;
  `;

  const reasonsTitle = document.createElement('div');
  reasonsTitle.style.cssText = `
    font-weight: 600;
    margin-bottom: 10px;
    opacity: 0.9;
  `;
  reasonsTitle.textContent = 'Why this email is suspicious:';
  reasonsList.appendChild(reasonsTitle);

  for (const reason of reasons) {
    const reasonItem = document.createElement('div');
    reasonItem.style.cssText = `
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      margin-bottom: 6px;
      border-left: 3px solid rgba(255, 255, 255, 0.5);
      word-break: break-word;
    `;
    reasonItem.innerHTML = `<span style="margin-right: 6px;">•</span>${reason}`;
    reasonsList.appendChild(reasonItem);
  }

  // Actions
  const actions = document.createElement('div');
  actions.style.cssText = `
    margin-top: 16px;
    display: flex;
    gap: 10px;
    font-size: 13px;
    flex-wrap: wrap;
  `;

  const dismissBtn = document.createElement('button');
  dismissBtn.id = 'mailguard-dismiss';
  dismissBtn.textContent = '✕ Dismiss';
  dismissBtn.style.cssText = `
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    font-size: 13px;
  `;
  dismissBtn.onmouseover = () => {
    dismissBtn.style.background = 'rgba(255, 255, 255, 0.35)';
    dismissBtn.style.transform = 'translateY(-2px)';
  };
  dismissBtn.onmouseout = () => {
    dismissBtn.style.background = 'rgba(255, 255, 255, 0.25)';
    dismissBtn.style.transform = 'translateY(0)';
  };

  const reportBtn = document.createElement('button');
  reportBtn.id = 'mailguard-report';
  reportBtn.textContent = '🚨 Report Phishing';
  reportBtn.style.cssText = `
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    font-size: 13px;
  `;
  reportBtn.onmouseover = () => {
    reportBtn.style.background = 'rgba(0, 0, 0, 0.35)';
    reportBtn.style.transform = 'translateY(-2px)';
  };
  reportBtn.onmouseout = () => {
    reportBtn.style.background = 'rgba(0, 0, 0, 0.25)';
    reportBtn.style.transform = 'translateY(0)';
  };

  reportBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'report',
      email: currentEmailData,
    });
    const confirmMsg = document.createElement('div');
    confirmMsg.textContent = '✓ Report submitted - Thank you!';
    confirmMsg.style.cssText = `
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      margin-top: 8px;
      text-align: center;
      font-weight: 600;
    `;
    reportBtn.parentElement?.insertBefore(confirmMsg, reportBtn.nextSibling);
    reportBtn.style.opacity = '0.5';
    reportBtn.disabled = true;
  });

  actions.appendChild(dismissBtn);
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
