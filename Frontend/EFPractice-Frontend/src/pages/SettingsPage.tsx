import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  applyAppearanceSettings,
  defaultAppearanceSettings,
  loadAppearanceSettings,
  saveAppearanceSettings,
  type AppearancePresetKey,
  type AppearanceSettings,
} from '../theme/appearance';
import '../styles/SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppearanceSettings>(defaultAppearanceSettings);

  useEffect(() => {
    const current = loadAppearanceSettings();
    setSettings(current);
    applyAppearanceSettings(current);
  }, []);

  const updateSettings = (next: AppearanceSettings) => {
    setSettings(next);
    saveAppearanceSettings(next);
    applyAppearanceSettings(next);
  };

  return (
    <div id="settings-page">
      <section className="settings-card">
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>

        <h1>Appearance Settings</h1>
        <p>Customize how the app looks for your account on this browser.</p>

        <label htmlFor="preset">Color theme</label>
        <select
          id="preset"
          value={settings.preset}
          onChange={(event) =>
            updateSettings({
              ...settings,
              preset: event.target.value as AppearancePresetKey,
            })
          }
        >
          <option value="midnight">Midnight Blue</option>
          <option value="mint">Emerald Mint</option>
          <option value="sunset">Sunset Orange</option>
          <option value="aurora">Aurora Cyan</option>
          <option value="graphite">Graphite Gray</option>
          <option value="sandstone">Sandstone Light</option>
        </select>

        <label htmlFor="font-scale">
          Text size: {Math.round(settings.fontScale * 100)}%
        </label>
        <input
          id="font-scale"
          type="range"
          min="0.9"
          max="1.2"
          step="0.05"
          value={settings.fontScale}
          onChange={(event) =>
            updateSettings({
              ...settings,
              fontScale: Number(event.target.value),
            })
          }
        />

        <div className="settings-preview">
          <h2>Preview</h2>
          <div className="preview-row">
            <button type="button">Primary Button</button>
            <span className="preview-chip">Accent sample</span>
          </div>
        </div>

        <button
          className="reset-button"
          type="button"
          onClick={() => {
            updateSettings(defaultAppearanceSettings);
          }}
        >
          Reset to Default
        </button>
      </section>
    </div>
  );
}

export default SettingsPage;
