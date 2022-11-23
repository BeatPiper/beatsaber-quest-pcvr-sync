import fs from 'fs';
import path from 'path';

interface Settings {
  customConfigPath?: string;
  customGamePath?: string;
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

export function getCustomConfigPath(): string | undefined {
  return getSettings().customConfigPath;
}

export function updateCustomConfigPath(customConfigPath: string) {
  const settings = getSettings();
  settings.customConfigPath = customConfigPath;
  updateSettings(settings);
}

export function getCustomGamePath(): string | undefined {
  return getSettings().customGamePath;
}

export function updateCustomGamePath(customGamePath: string) {
  const settings = getSettings();
  settings.customGamePath = customGamePath;
  updateSettings(settings);
}
