import { BeatSaberPlaylistFile } from '../types/beatSaber';
import { changeExtensionToBplist } from './index';

export function isSamePlaylist(a: BeatSaberPlaylistFile, b: BeatSaberPlaylistFile) {
  const { playlist: playlist1 } = a;
  const { playlist: playlist2 } = b;
  // doesn't matter which changeExtension function to use here
  const name1 = changeExtensionToBplist(a.fileName);
  const name2 = changeExtensionToBplist(b.fileName);
  return name1 === name2 || playlist1.playlistTitle === playlist2.playlistTitle;
}
