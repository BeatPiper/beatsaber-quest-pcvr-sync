import Stream from 'stream';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { PLAYERDATA_FILE, PLAYERDATA_PATH_QUEST } from './constants';
import { LocalPlayer, PlayerData } from './types/playerData';
import chalk from 'chalk';
import { Sync } from '@u4/adbkit';
import { getCustomPath } from './settings';

function streamToString(stream: Stream): Promise<string> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', err => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

function stringToStream(input: string): Stream.Readable {
  const stream = new Stream.Readable();
  stream.push(input);
  stream.push(null);
  return stream;
}

export function getBeatSaberPath(): string {
  const customPath = getCustomPath();
  if (customPath) {
    return customPath;
  }

  const { sep } = path;
  const relativePath = `AppData${sep}LocalLow${sep}Hyperbolic Magnetism${sep}Beat Saber`;
  const platform = os.platform();
  if (platform === 'win32') {
    return `${process.env.USERPROFILE}${sep}${relativePath}`;
  } else if (platform === 'linux') {
    return `${process.env.HOME}${sep}share${sep}Steam/steamapps${sep}compatdata${sep}620980${sep}pfx${sep}drive_c${sep}users${sep}steamuser${sep}${relativePath}`;
  }
  throw new Error('Unsupported platform');
}

const playerDataPath = (gamePath: string) => `${gamePath}${path.sep}${PLAYERDATA_FILE}`;

export function isValidBeatSaberPath(gamePath: string): boolean {
  return fs.existsSync(playerDataPath(gamePath));
}

export function getPcPlayerData(gamePath: string): PlayerData {
  return JSON.parse(fs.readFileSync(playerDataPath(gamePath), 'utf8'));
}

export function updatePcPlayerData(gamePath: string, playerData: PlayerData) {
  fs.writeFileSync(playerDataPath(gamePath), JSON.stringify(playerData), 'utf8');
}

export async function getQuestPlayerData(sync: Sync): Promise<PlayerData> {
  const favorites = await sync.pull(PLAYERDATA_PATH_QUEST);
  const data = await streamToString(favorites);
  return JSON.parse(data);
}

export async function updateQuestPlayerData(sync: Sync, playerData: PlayerData) {
  const data = stringToStream(JSON.stringify(playerData));
  await sync.push(data, PLAYERDATA_PATH_QUEST);
}

export function getLocalPlayer(playerData: PlayerData): LocalPlayer {
  if (!playerData?.localPlayers?.length) {
    console.log(chalk.red('No local players found in PlayerData.dat'));
    process.exit(1);
  }
  // TODO: handle multiple local players with a prompt
  return playerData.localPlayers[0];
}
