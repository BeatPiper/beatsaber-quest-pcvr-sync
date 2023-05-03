import path from 'path';
import fs from 'fs';
import { DeviceClient } from '@u4/adbkit';
import { SONGS_PATH_QUEST } from '../constants';
import { streamToString, streamToWriteStream } from '../utils/streams';
import { SongFile } from '../types/beatSaber';
import { getSongsPath } from '../utils/pcPaths';
import tar from 'tar';
import crypto from 'crypto';
import { sleep } from '../utils';
import os from 'os';

const getSongFiles = (items: fs.Dirent[]) =>
  items.filter(item => item.isDirectory()).map(({ name }) => name);

function getPcInfoFile(songFolder: string): string | null {
  const infoFileName = fs
    .readdirSync(songFolder, { withFileTypes: true })
    .find(item => item.isFile() && item.name.toLowerCase() === 'info.dat');
  return infoFileName?.name ?? null;
}

export function getPcSongs(gamePath: string): SongFile[] {
  const songsPath = getSongsPath(gamePath);
  if (!fs.existsSync(songsPath)) {
    return [];
  }
  const files = fs.readdirSync(songsPath, { withFileTypes: true });
  const songFiles = getSongFiles(files);
  const songs = songFiles.map(folder => {
    const songFolder = `${songsPath}${path.sep}${folder}`;
    const infoFile = getPcInfoFile(songFolder);

    if (!infoFile) {
      return null;
    }

    const data = fs.readFileSync(`${songFolder}${path.sep}${infoFile}`, 'utf8');
    return {
      folderName: folder,
      song: JSON.parse(data.trim()),
    };
  });
  return songs.filter(song => song !== null) as SongFile[];
}

export async function addSongToPc(song: SongFile, client: DeviceClient, gamePath: string) {
  const { tmpPcPath, tmpQuestPath } = getTempPaths(song);

  // compress the song folder
  await client.execOut(`cd ${SONGS_PATH_QUEST} && tar -cf ${tmpQuestPath} '${song.folderName}'`);
  // pull the archive
  const tarFile = await client.pull(tmpQuestPath);
  await streamToWriteStream(tarFile, fs.createWriteStream(tmpPcPath));

  // extract the archive
  await tar.extract({
    cwd: getSongsPath(gamePath),
    file: tmpPcPath,
  });

  // cleanup
  fs.unlinkSync(tmpPcPath);
  await client.exec(`rm ${tmpQuestPath}`);
}

export function removeSongFromPc(song: SongFile, gamePath: string) {
  const songPath = `${getSongsPath(gamePath)}${path.sep}${song.folderName}`;
  if (!fs.existsSync(songPath)) {
    return;
  }
  fs.rmSync(songPath, { recursive: true, force: true });
}

export async function getQuestSongs(client: DeviceClient): Promise<SongFile[]> {
  const files = await client.readdir(SONGS_PATH_QUEST);

  const songFiles = getSongFiles(files);

  // delay fetching workaround for AdbPrematureEOFError
  const songs = await Promise.all(
    songFiles.map(async (folder, index) => {
      await sleep(index);
      return getQuestSong(client, folder);
    })
  );
  // const songs = await Promise.all(songFiles.map(folder => getQuestSong(client, folder)));
  return songs.filter(song => song !== null) as SongFile[];
}

async function getQuestInfoFile(client: DeviceClient, songFolder: string): Promise<string | null> {
  const files = await client.readdir(songFolder);
  const infoFileName = files.find(file => file.name.toLowerCase() === 'info.dat');

  return infoFileName?.name ?? null;
}

async function getQuestSong(client: DeviceClient, folderName: string): Promise<SongFile | null> {
  const songFolder = `${SONGS_PATH_QUEST}${folderName}`;
  const infoFile = await getQuestInfoFile(client, songFolder);

  if (!infoFile) {
    return null;
  }

  const song = await client.pull(`${songFolder}/${infoFile}`);
  const data = await streamToString(song);
  return {
    folderName,
    song: JSON.parse(data.trim()),
  };
}

export async function addSongToQuest(song: SongFile, client: DeviceClient, gamePath: string) {
  const { tmpPcPath, tmpQuestPath } = getTempPaths(song);

  // compress the song folder
  await tar.create(
    {
      file: tmpPcPath,
      cwd: getSongsPath(gamePath),
    },
    [song.folderName]
  );
  // push the archive
  await client.push(tmpPcPath, tmpQuestPath);

  // extract the archive
  await client.execOut(`cd ${SONGS_PATH_QUEST} && tar -xf ${tmpQuestPath}`);

  // cleanup
  fs.unlinkSync(tmpPcPath);
  await client.exec(`rm ${tmpQuestPath}`);
}

export async function removeSongFromQuest(song: SongFile, client: DeviceClient) {
  await client.exec(`rm -rf '${SONGS_PATH_QUEST}${song.folderName}'`);
}

function getTempPaths(song: SongFile) {
  const hash = crypto.createHash('sha1').update(song.folderName).digest('hex');
  const tmpFileName = `${hash}.tar`;
  const tmpPcPath = `${os.tmpdir()}${path.sep}${tmpFileName}`;
  const tmpQuestPath = `/sdcard/${tmpFileName}`;
  return { tmpPcPath, tmpQuestPath };
}
