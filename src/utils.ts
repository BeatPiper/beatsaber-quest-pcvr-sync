import Stream from 'stream';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { PLAYERDATA_FILE, PLAYERDATA_PATH_QUEST, PLAYLISTS_PATH_QUEST } from './constants';
import { LocalPlayer, PlayerData } from './types/playerData';
import chalk from 'chalk';
import { DeviceClient, Sync } from '@u4/adbkit';
import { getCustomConfigPath, getCustomGamePath } from './settings';
import { BeatSaberPlaylistFile } from './types/beatSaber';

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

const changeExtensionToBplist = (fileName: string) => fileName.replace(/(_BMBF)?\.json$/, '.bplist');
const changeExtensionToJson = (fileName: string) => fileName.replace(/\.bplist$/, '_BMBF.json');

const playerDataPath = (gamePath: string) => `${gamePath}${path.sep}${PLAYERDATA_FILE}`;

export function isValidBeatSaberConfigPath(configPath: string): boolean {
  return fs.existsSync(playerDataPath(configPath));
}

export function getBeatSaberGamePath(): string {
  const customGamePath = getCustomGamePath();
  if (customGamePath) {
    return customGamePath;
  }
  const { sep } = path;
  const platform = os.platform();

  if (platform === 'win32') {
    return `${process.env['PROGRAMFILES(X86)']}${sep}Steam${sep}steamapps${sep}common${sep}Beat Saber`;
  } else if (platform === 'linux') {
    return `${process.env.HOME}${sep}.local${sep}share${sep}Steam/steamapps${sep}common${sep}Beat Saber`;
  }

  throw new Error('Unsupported platform');
}

export function isValidBeatSaberGamePath(gamePath: string): boolean {
  return fs.existsSync(`${gamePath}${path.sep}Beat Saber.exe`);
}

export function getPcPlayerData(configPath: string): PlayerData {
  const data = fs.readFileSync(playerDataPath(configPath), 'utf8');
  return JSON.parse(data.trim());
}

export function updatePcPlayerData(configPath: string, playerData: PlayerData) {
  fs.writeFileSync(playerDataPath(configPath), JSON.stringify(playerData), 'utf8');
}

export async function getQuestPlayerData(sync: Sync): Promise<PlayerData> {
  const favorites = await sync.pull(PLAYERDATA_PATH_QUEST);
  const data = await streamToString(favorites);
  return JSON.parse(data.trim());
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

export function getPcPlaylists(gamePath: string): BeatSaberPlaylistFile[] {
  const playlistsPath = `${gamePath}${path.sep}Playlists`;
  if (!fs.existsSync(playlistsPath)) {
    return [];
  }
  const files = fs.readdirSync(playlistsPath);
  const playlists = files.filter(file => file.endsWith('.bplist'));
  return playlists.map(file => {
    const data = fs.readFileSync(`${playlistsPath}${path.sep}${file}`, 'utf8');
    return {
      fileName: file,
      playlist: JSON.parse(data.trim()),
    };
  });
}

export function addPlaylistToPc(playlist: BeatSaberPlaylistFile, gamePath: string) {
  const playlistsPath = `${gamePath}${path.sep}Playlists`;
  if (!fs.existsSync(playlistsPath)) {
    fs.mkdirSync(playlistsPath);
  }
  fs.writeFileSync(
    `${playlistsPath}${path.sep}${changeExtensionToBplist(playlist.fileName)}`,
    JSON.stringify(playlist.playlist),
    'utf8'
  );
}

export function removePlaylistFromPc(playlist: BeatSaberPlaylistFile, gamePath: string) {
  const playlistPath = `${gamePath}${path.sep}Playlists${path.sep}${changeExtensionToBplist(
    playlist.fileName
  )}`;
  if (!fs.existsSync(playlistPath)) {
    return;
  }
  fs.unlinkSync(playlistPath);
}

export async function getQuestPlaylists(client: DeviceClient): Promise<BeatSaberPlaylistFile[]> {
  const files = await client.readdir(PLAYLISTS_PATH_QUEST);

  const playlists = files.filter(({ name }) => name.endsWith('.json'));
  return Promise.all(
    playlists.map(({ name }) => {
      return getQuestPlaylist(client, name);
    })
  );
}

async function getQuestPlaylist(
  client: DeviceClient,
  playlistFile: string
): Promise<BeatSaberPlaylistFile> {
  const playlist = await client.pull(`${PLAYLISTS_PATH_QUEST}${playlistFile}`);
  const data = await streamToString(playlist);
  return {
    fileName: playlistFile,
    playlist: JSON.parse(data.trim()),
  };
}

export async function addPlaylistToQuest(playlist: BeatSaberPlaylistFile, client: DeviceClient) {
  const sync = await client.syncService();
  const data = stringToStream(JSON.stringify(playlist.playlist));
  await sync.push(data, `${PLAYLISTS_PATH_QUEST}${changeExtensionToJson(playlist.fileName)}`);
  sync.end();
}

export async function removePlaylistFromQuest(playlist: BeatSaberPlaylistFile, client: DeviceClient) {
  await client.shell(`rm -rf '${PLAYLISTS_PATH_QUEST}${changeExtensionToJson(playlist.fileName)}'`);
}

// TODO: refactor favorite/playlist/other stuff in own file
