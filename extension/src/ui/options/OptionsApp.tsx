import React, { useEffect, useState } from 'react';
// @ts-ignore - CSS module typings not present in this workspace
import styles from './OptionsApp.module.css';

interface StorageSettings {
  cloudAnalysisEnabled: boolean;
  privacyConsent: boolean;
  whitelistedSenders: string[];
  blockedSenders: string[];
  reportCount: number;
}

const OptionsApp: React.FC = () => {
  const [settings, setSettings] = useState<StorageSettings>({
    cloudAnalysisEnabled: false,
    privacyConsent: false,
    whitelistedSenders: [],
    blockedSenders: [],
    reportCount: 0,
  });

  const [newWhitelistEmail, setNewWhitelistEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('security');

  // Load settings on mount
  useEffect(() => {
    chrome.storage.sync.get(
      [
        'cloudAnalysisEnabled',
        'privacyConsent',
        'whitelistedSenders',
        'blockedSenders',
        'reportCount',
      ],
      (result) => {
        setSettings({
          cloudAnalysisEnabled: result.cloudAnalysisEnabled || false,
          privacyConsent: result.privacyConsent || false,
          whitelistedSenders: result.whitelistedSenders || [],
          blockedSenders: result.blockedSenders || [],
          reportCount: result.reportCount || 0,
        });
        setLoading(false);
      }
    );
  }, []);

  const updateSetting = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    chrome.storage.sync.set({ [key]: value });
  };

  const addToWhitelist = () => {
    if (newWhitelistEmail && !settings.whitelistedSenders.includes(newWhitelistEmail)) {
      const updated = [...settings.whitelistedSenders, newWhitelistEmail];
      updateSetting('whitelistedSenders', updated);
      setNewWhitelistEmail('');
      setSuccessMessage('✓ Email added to trusted senders!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const removeFromWhitelist = (email: string) => {
    const updated = settings.whitelistedSenders.filter((e) => e !== email);
    updateSetting('whitelistedSenders', updated);
  };

  const clearData = () => {
    if (confirm('Are you sure? This will clear all extension data and reset to defaults.')) {
      chrome.storage.sync.clear(() => {
        setSettings({
          cloudAnalysisEnabled: false,
          privacyConsent: false,
          whitelistedSenders: [],
          blockedSenders: [],
          reportCount: 0,
        });
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Logo */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>🛡️</div>
          <div>
            <h1 className={styles.title}>MailGuard</h1>
            <p className={styles.subtitle}>Privacy-First Email Protection</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'security' ? styles.active : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'senders' ? styles.active : ''}`}
          onClick={() => setActiveTab('senders')}
        >
          ✅ Trusted Senders
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </nav>

      {/* Success Message */}
      {successMessage && <div className={styles.successAlert}>{successMessage}</div>}

      {/* Tab Content */}
      <main className={styles.content}>
        {/* Security Tab */}
        {activeTab === 'security' && (
          <section className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>� Privacy & Security Settings</h2>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Cloud Analysis</h3>
                <span className={styles.badge}>Advanced</span>
              </div>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id="cloudAnalysis"
                  checked={settings.cloudAnalysisEnabled}
                  onChange={(e) => updateSetting('cloudAnalysisEnabled', e.target.checked)}
                />
                <label htmlFor="cloudAnalysis" className={styles.slider}></label>
              </div>
              <p className={styles.cardDescription}>
                Enable ML-powered analysis for more accurate phishing detection. Your data is
                encrypted and processed securely.
              </p>
              <div className={styles.feature}>
                <span>✓</span> Offline-first by default
              </div>
              <div className={styles.feature}>
                <span>✓</span> Opt-in cloud analysis
              </div>
              <div className={styles.feature}>
                <span>✓</span> No personal data collection
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Privacy Policy</h3>
                <span className={styles.badge}>Important</span>
              </div>
              <div className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  id="privacyConsent"
                  checked={settings.privacyConsent}
                  onChange={(e) => updateSetting('privacyConsent', e.target.checked)}
                />
                <label htmlFor="privacyConsent" className={styles.slider}></label>
              </div>
              <p className={styles.cardDescription}>
                I agree to MailGuard&apos;s privacy practices. By default, all analysis happens
                offline on your device.
              </p>
              <a href="#privacy" className={styles.link}>
                → Read full Privacy Policy
              </a>
            </div>
          </section>
        )}

        {/* Trusted Senders Tab */}
        {activeTab === 'senders' && (
          <section className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>✅ Trusted Senders Management</h2>

            <div className={styles.card}>
              <h3>Add Trusted Sender</h3>
              <div className={styles.emailInput}>
                <input
                  type="email"
                  value={newWhitelistEmail}
                  onChange={(e) => setNewWhitelistEmail(e.target.value)}
                  placeholder="name@example.com"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') addToWhitelist();
                  }}
                />
                <button className={styles.addBtn} onClick={addToWhitelist}>
                  + Add
                </button>
              </div>
              <p className={styles.cardDescription}>
                Trusted senders will never trigger phishing warnings, even if they match
                suspicious patterns.
              </p>
            </div>

            {settings.whitelistedSenders.length > 0 && (
              <div className={styles.card}>
                <h3>Your Trusted List ({settings.whitelistedSenders.length})</h3>
                <div className={styles.sendersList}>
                  {settings.whitelistedSenders.map((email) => (
                    <div key={email} className={styles.senderItem}>
                      <div className={styles.senderInfo}>
                        <span className={styles.senderAvatar}>👤</span>
                        <span className={styles.senderEmail}>{email}</span>
                      </div>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromWhitelist(email)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {settings.whitelistedSenders.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <p>No trusted senders yet. Add one to get started!</p>
              </div>
            )}
          </section>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <section className={styles.tabContent}>
            <h2 className={styles.sectionTitle}>📊 Your Statistics</h2>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>🚨</div>
                <div className={styles.statContent}>
                  <h3>Emails Reported</h3>
                  <p className={styles.statValue}>{settings.reportCount}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statContent}>
                  <h3>Trusted Senders</h3>
                  <p className={styles.statValue}>{settings.whitelistedSenders.length}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>🛡️</div>
                <div className={styles.statContent}>
                  <h3>Protection Level</h3>
                  <p className={styles.statValue}>Active</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>📍</div>
                <div className={styles.statContent}>
                  <h3>Mode</h3>
                  <p className={styles.statValue}>
                    {settings.cloudAnalysisEnabled ? 'Hybrid' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h3>ℹ️ How Your Data is Protected</h3>
              <ul className={styles.protectionList}>
                <li>✓ All analysis happens on your device by default</li>
                <li>✓ No email content stored or sent without consent</li>
                <li>✓ Phishing patterns detected locally in real-time</li>
                <li>✓ Your trusted senders list is encrypted</li>
                <li>✓ Anonymous reporting helps improve detection</li>
              </ul>
            </div>

            <div className={styles.dangerCard}>
              <h3>⚠️ Data Management</h3>
              <button className={styles.dangerBtn} onClick={clearData}>
                🗑️ Clear All Data & Reset
              </button>
              <p className={styles.cardDescription}>
                This will delete all settings, trusted senders, and statistics. This action cannot
                be undone.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.version}>MailGuard v0.1.0</p>
          <div className={styles.footerLinks}>
            <a href="#privacy">Privacy</a>
            <span className={styles.separator}>•</span>
            <a href="#support">Support</a>
            <span className={styles.separator}>•</span>
            <a href="#github">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OptionsApp;
