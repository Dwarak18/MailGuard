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
    return <div className={styles.container}>Loading settings...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>MailGuard Settings</h1>
        <p>Manage your email security preferences</p>
      </header>

      <div className={styles.section}>
        <h2>🔒 Privacy & Security</h2>

        <div className={styles.setting}>
          <label>
            <input
              type="checkbox"
              checked={settings.cloudAnalysisEnabled}
              onChange={(e) => updateSetting('cloudAnalysisEnabled', e.target.checked)}
            />
            <span>Enable Cloud Analysis (ML)</span>
          </label>
          <p className={styles.helpText}>
            When enabled, suspicious emails will be analyzed by our backend ML model for more
            accurate detection. Your email content will be sent to our servers (with your
            explicit consent before each analysis).
          </p>
        </div>

        <div className={styles.setting}>
          <label>
            <input
              type="checkbox"
              checked={settings.privacyConsent}
              onChange={(e) => updateSetting('privacyConsent', e.target.checked)}
            />
            <span>Accept Privacy Policy</span>
          </label>
          <p className={styles.helpText}>
            I have read and accept the{' '}
            <a href="#" target="_blank">
              Privacy Policy
            </a>
            . By default, MailGuard runs completely offline and does not send any data.
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>✅ Trusted Senders</h2>

        <div className={styles.whitelistInput}>
          <input
            type="email"
            value={newWhitelistEmail}
            onChange={(e) => setNewWhitelistEmail(e.target.value)}
            placeholder="Enter email address to whitelist..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') addToWhitelist();
            }}
          />
          <button onClick={addToWhitelist}>Add</button>
        </div>

        {settings.whitelistedSenders.length > 0 ? (
          <div className={styles.list}>
            {settings.whitelistedSenders.map((email) => (
              <div key={email} className={styles.listItem}>
                <span>{email}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeFromWhitelist(email)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.helpText}>No trusted senders yet.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2>📊 Statistics</h2>
        <p>Emails reported as phishing: {settings.reportCount}</p>
      </div>

      <div className={styles.section}>
        <h2>⚠️ Danger Zone</h2>
        <button className={styles.dangerBtn} onClick={clearData}>
          Clear All Data & Reset
        </button>
        <p className={styles.helpText}>
          This will delete all stored data including trusted senders, statistics, and settings.
        </p>
      </div>

      <footer className={styles.footer}>
        <p>MailGuard v0.1.0 • Privacy-First Phishing Detection</p>
        <p>
          <a href="#privacy">Privacy Policy</a> • <a href="#support">Support</a>
        </p>
      </footer>
    </div>
  );
};

export default OptionsApp;
