export type AppearancePresetKey =
  | 'midnight'
  | 'mint'
  | 'sunset'
  | 'aurora'
  | 'graphite'
  | 'sandstone';

export type AppearanceSettings = {
  preset: AppearancePresetKey;
  fontScale: number;
};

type AppearancePreset = {
  text: string;
  textH: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  surfaceStrong: string;
  selectBg: string;
  accent: string;
  accentStrong: string;
  accentBg: string;
  accentBorder: string;
  border: string;
  deadlineOverdue: string;
};

const STORAGE_KEY = 'efpractice-appearance-settings';

export const presets: Record<AppearancePresetKey, AppearancePreset> = {
  midnight: {
    text: '#cbd5e1',
    textH: '#f8fafc',
    bg: '#090b13',
    surface: '#111827',
    surfaceAlt: '#0f172a',
    surfaceStrong: '#161b2f',
    selectBg: '#1f2937',
    accent: '#60a5fa',
    accentStrong: '#38bdf8',
    accentBg: 'rgba(56, 189, 248, 0.15)',
    accentBorder: 'rgba(56, 189, 248, 0.35)',
    border: 'rgba(96, 165, 250, 0.18)',
    deadlineOverdue: '#fb7185',
  },
  mint: {
    text: '#d1fae5',
    textH: '#ecfdf5',
    bg: '#07130f',
    surface: '#0f1f1a',
    surfaceAlt: '#10261f',
    surfaceStrong: '#133128',
    selectBg: '#18372d',
    accent: '#34d399',
    accentStrong: '#10b981',
    accentBg: 'rgba(52, 211, 153, 0.16)',
    accentBorder: 'rgba(52, 211, 153, 0.38)',
    border: 'rgba(52, 211, 153, 0.22)',
    deadlineOverdue: '#f97316',
  },
  sunset: {
    text: '#fde7dd',
    textH: '#fff5f0',
    bg: '#1b0c0a',
    surface: '#2a1210',
    surfaceAlt: '#331815',
    surfaceStrong: '#3d1c18',
    selectBg: '#4a231e',
    accent: '#fb923c',
    accentStrong: '#f97316',
    accentBg: 'rgba(251, 146, 60, 0.16)',
    accentBorder: 'rgba(251, 146, 60, 0.4)',
    border: 'rgba(251, 146, 60, 0.24)',
    deadlineOverdue: '#fde047',
  },
  aurora: {
    text: '#d6eef4',
    textH: '#f3fdff',
    bg: '#061319',
    surface: '#0b2028',
    surfaceAlt: '#102933',
    surfaceStrong: '#143543',
    selectBg: '#1b4454',
    accent: '#22d3ee',
    accentStrong: '#0ea5e9',
    accentBg: 'rgba(34, 211, 238, 0.17)',
    accentBorder: 'rgba(34, 211, 238, 0.36)',
    border: 'rgba(14, 165, 233, 0.22)',
    deadlineOverdue: '#f43f5e',
  },
  graphite: {
    text: '#e5e7eb',
    textH: '#f9fafb',
    bg: '#0b0c0f',
    surface: '#151821',
    surfaceAlt: '#1a202b',
    surfaceStrong: '#202837',
    selectBg: '#2a3448',
    accent: '#9ca3af',
    accentStrong: '#6b7280',
    accentBg: 'rgba(156, 163, 175, 0.16)',
    accentBorder: 'rgba(156, 163, 175, 0.34)',
    border: 'rgba(156, 163, 175, 0.2)',
    deadlineOverdue: '#f59e0b',
  },
  sandstone: {
    text: '#3a2b1e',
    textH: '#2a1f16',
    bg: '#f3e8d7',
    surface: '#efe0cb',
    surfaceAlt: '#e6d2b8',
    surfaceStrong: '#dcc1a0',
    selectBg: '#cfad84',
    accent: '#b45309',
    accentStrong: '#92400e',
    accentBg: 'rgba(180, 83, 9, 0.16)',
    accentBorder: 'rgba(146, 64, 14, 0.34)',
    border: 'rgba(120, 53, 15, 0.24)',
    deadlineOverdue: '#b91c1c',
  },
};

export const defaultAppearanceSettings: AppearanceSettings = {
  preset: 'midnight',
  fontScale: 1,
};

export function loadAppearanceSettings(): AppearanceSettings {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAppearanceSettings;

  try {
    const parsed = JSON.parse(raw) as Partial<AppearanceSettings>;
    const preset = parsed.preset && parsed.preset in presets ? parsed.preset : defaultAppearanceSettings.preset;
    const fontScale = typeof parsed.fontScale === 'number' ? Math.min(1.2, Math.max(0.9, parsed.fontScale)) : 1;

    return {
      preset,
      fontScale,
    };
  } catch {
    return defaultAppearanceSettings;
  }
}

export function saveAppearanceSettings(settings: AppearanceSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applyAppearanceSettings(settings: AppearanceSettings): void {
  const root = document.documentElement;
  const selected = presets[settings.preset];

  root.style.setProperty('--text', selected.text);
  root.style.setProperty('--text-h', selected.textH);
  root.style.setProperty('--bg', selected.bg);
  root.style.setProperty('--surface', selected.surface);
  root.style.setProperty('--surface-alt', selected.surfaceAlt);
  root.style.setProperty('--surface-strong', selected.surfaceStrong);
  root.style.setProperty('--select-bg', selected.selectBg);
  root.style.setProperty('--accent', selected.accent);
  root.style.setProperty('--accent-strong', selected.accentStrong);
  root.style.setProperty('--accent-bg', selected.accentBg);
  root.style.setProperty('--accent-border', selected.accentBorder);
  root.style.setProperty('--border', selected.border);
  root.style.setProperty('--deadline-overdue', selected.deadlineOverdue);
  root.style.setProperty('--font-scale', String(settings.fontScale));
}
