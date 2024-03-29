import { getCustomConfigPath, getCustomGamePath } from '../settings';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { PLAYERDATA_FILE } from '../constants';

export function getBeatSaberConfigPath(): string {
  const customConfigPath = getCustomConfigPath();
  if (customConfigPath) {
    return customConfigPath;
  }

  const { sep } = path;
  const relativePath = `AppData${sep}LocalLow${sep}Hyperbolic Magnetism${sep}Beat Saber`;
  const platform = os.platform();

  if (platform === 'win32') {
    return `${process.env.USERPROFILE}${sep}${relativePath}`;
  } else if (platform === 'linux') {
    return `${process.env.HOME}${sep}.local${sep}share${sep}Steam/steamapps${sep}compatdata${sep}620980${sep}pfx${sep}drive_c${sep}users${sep}steamuser${sep}${relativePath}`;
  }
  throw new Error('Unsupported platform');
}

export function isValidBeatSaberConfigPath(configPath: string): boolean {
  return fs.existsSync(getPlayerDataPath(configPath));
}

export function getBeatSaberGamePath(): string {
  const customGamePath = getCustomGamePath();
  if (customGamePath) {
    return customGamePath;
  }

  const { sep } = path;
  const relativePath = `steamapps${sep}common${sep}Beat Saber`;
  const platform = os.platform();

  if (platform === 'win32') {
    return `${process.env['PROGRAMFILES(X86)']}${sep}Steam${sep}${relativePath}`;
  } else if (platform === 'linux') {
    return `${process.env.HOME}${sep}.local${sep}share${sep}Steam/${relativePath}`;
  }
  throw new Error('Unsupported platform');
}

export function isValidBeatSaberGamePath(gamePath: string): boolean {
  return fs.existsSync(`${gamePath}${path.sep}Beat Saber.exe`);
}

export const getPlayerDataPath = (configPath: string) => `${configPath}${path.sep}${PLAYERDATA_FILE}`;
export const getPlaylistsPath = (gamePath: string) => `${gamePath}${path.sep}Playlists`;
export const getSongsPath = (gamePath: string) =>
  `${gamePath}${path.sep}Beat Saber_Data${path.sep}CustomLevels`;
