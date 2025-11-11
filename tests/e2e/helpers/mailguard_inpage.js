// Minimal in-page MailGuard helper for E2E fixture testing
// Exposes window.mailguardAnalyzeAndInject(emailData)
(function () {
  function checkDisplayNameMismatch(displayName, from) {
    if (!displayName || !from) return null;
    const displayNameLower = displayName.toLowerCase();
    const fromLower = from.toLowerCase();
    if (!fromLower.includes(displayNameLower.split(' ')[0])) {
      return `Display name "${displayName}" doesn't match sender address "${from}"`;
    }
    return null;
  }

  function checkSuspiciousUrl(url) {
    const issues = [];
    try {
      var urlObj = new URL(url);
      if (urlObj.href.includes('@')) {
        issues.push(`URL contains @ symbol: ${url}`);
      }
      if (/^https?:\/\/\d+\.\d+\.\d+\.\d+/.test(url)) {
        issues.push(`URL uses IP address: ${url}`);
      }
      if (urlObj.pathname.length > 100) {
        issues.push(`URL has unusually long path: ${url}`);
      }
      if (/%[0-9A-Fa-f]{2}/.test(urlObj.pathname)) {
        issues.push(`URL contains encoded characters: ${url}`);
      }
    } catch (e) {
      issues.push(`Invalid URL format: ${url}`);
    }
    return issues;
  }

  function checkUrgencyKeywords(text) {
    const issues = [];
    const patterns = [
      /verify.*account/i,
      /confirm.*password/i,
      /urgent.*action/i,
      /click.*immediately/i,
      /account.*suspend/i,
      /unauthorized.*activity/i,
      /update.*payment/i,
    ];
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].test(text)) {
        issues.push(`Contains urgency trigger: "${text.match(patterns[i])[0]}"`);
      }
    }
    return issues;
  }

  function createBanner(reasons, score) {
    const banner = document.createElement('div');
    banner.id = 'mailguard-banner';
    banner.setAttribute('data-mailguard-score', String(score));
    banner.style.cssText = 'padding:12px 16px;margin:8px 0;background:#ff6b6b;color:white;border-radius:6px;';
    const header = document.createElement('div');
    header.textContent = '⚠️ Suspicious Email Detected';
    header.style.fontWeight = '600';
    banner.appendChild(header);
    const scoreEl = document.createElement('div');
    scoreEl.textContent = `Risk Score: ${score}/100`;
    scoreEl.style.fontSize = '13px';
    scoreEl.style.marginTop = '6px';
    banner.appendChild(scoreEl);
    const ul = document.createElement('ul');
    ul.style.marginTop = '8px';
    for (var i = 0; i < reasons.length; i++) {
      const li = document.createElement('li');
      li.textContent = reasons[i];
      ul.appendChild(li);
    }
    banner.appendChild(ul);
    return banner;
  }

  // Main exposed function
  window.mailguardAnalyzeAndInject = function (email) {
    var reasons = [];
    var score = 0;
    var dnameIssue = checkDisplayNameMismatch(email.displayName, email.from);
    if (dnameIssue) {
      reasons.push(dnameIssue);
      score += 25;
    }
    if (email.links && email.links.length) {
      for (var i = 0; i < email.links.length; i++) {
        var uissues = checkSuspiciousUrl(email.links[i]);
        if (uissues.length) {
          reasons = reasons.concat(uissues);
          score += 15;
        }
      }
    }
    var urgency = checkUrgencyKeywords((email.subject || '') + ' ' + (email.body || ''));
    if (urgency.length) {
      reasons = reasons.concat(urgency);
      score += 10;
    }

    var suspicious = score >= 35;
    if (suspicious) {
      var banner = createBanner(reasons, score);
      var container = document.querySelector('.email-body') || document.body;
      // remove old banner if exists
      var old = document.getElementById('mailguard-banner');
      if (old) old.remove();
      container.insertBefore(banner, container.firstChild);
    }
    return { suspicious: suspicious, score: score, reasons: reasons };
  };
})();
