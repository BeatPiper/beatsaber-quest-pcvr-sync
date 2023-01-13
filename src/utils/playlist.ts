import { BeatSaberPlaylistFile } from '../types/beatSaber';
import path from 'path';
import fs from 'fs';
import { DeviceClient } from '@u4/adbkit';
import { PLAYLISTS_PATH_QUEST } from '../constants';
import { changeExtensionToBplist, changeExtensionToJson } from './index';
import { streamToString, stringToStream } from './streams';
import { getPlaylistsPath } from './pcPaths';

export function getPcPlaylists(gamePath: string): BeatSaberPlaylistFile[] {
  const playlistsPath = getPlaylistsPath(gamePath);
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
  const playlistsPath = getPlaylistsPath(gamePath);
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
  const playlistPath = `${getPlaylistsPath(gamePath)}${path.sep}${changeExtensionToBplist(
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
