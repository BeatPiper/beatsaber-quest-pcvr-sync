import { BeatSaberPlaylistFile, SongFile } from '../types/beatSaber';
import { changeExtensionToBplist } from './index';

export function isSamePlaylist(a: BeatSaberPlaylistFile, b: BeatSaberPlaylistFile) {
  const { playlist: playlist1 } = a;
  const { playlist: playlist2 } = b;
  // doesn't matter which changeExtension function to use here
  const name1 = changeExtensionToBplist(a.fileName);
  const name2 = changeExtensionToBplist(b.fileName);
  return name1 === name2 || playlist1.playlistTitle === playlist2.playlistTitle;
}

export function isSameSong(a: SongFile, b: SongFile) {
  const { song: song1 } = a;
  const { song: song2 } = b;
  return song1._songName === song2._songName && song1._songAuthorName === song2._songAuthorName;
}
