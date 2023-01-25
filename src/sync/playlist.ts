import { BeatSaberPlaylistFile } from '../types/beatSaber';
import path from 'path';
import fs from 'fs';
import { DeviceClient } from '@u4/adbkit';
import { PLAYLISTS_PATH_QUEST } from '../constants';
import { changeExtensionToBplist, changeExtensionToJson } from '../utils';
import { streamToString, stringToStream } from '../utils/streams';
import { getPlaylistsPath } from '../utils/pcPaths';

export function getPcPlaylists(gamePath: string): BeatSaberPlaylistFile[] {
  const playlistsPath = getPlaylistsPath(gamePath);
  if (!fs.existsSync(playlistsPath)) {
    return [];
  }
  const files = fs.readdirSync(playlistsPath, { withFileTypes: true });
  const playlistFiles = files
    .filter(item => item.isFile() && item.name.endsWith('.bplist'))
    .map(({ name }) => name);
  return playlistFiles.map(file => {
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

  const playlistFiles = files.filter(item => item.isFile() && item.name.endsWith('.json'));
  return Promise.all(
    playlistFiles.map(({ name }) => {
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
  await client.exec(`rm -rf '${PLAYLISTS_PATH_QUEST}${changeExtensionToJson(playlist.fileName)}'`);
}
