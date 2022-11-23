import fs from 'fs';
import path from 'path';

interface Settings {
  customPath?: string;
}

const settingsPath = `.${path.sep}settings.json`;

function getSettings(): Settings {
  if (!fs.existsSync(settingsPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
}

function updateSettings(settings: Settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings), 'utf8');
}

export function getCustomPath(): string | undefined {
  return getSettings().customPath;
}

export function updateCustomPath(customPath: string) {
  const settings = getSettings();
  settings.customPath = customPath;
  updateSettings(settings);
}
