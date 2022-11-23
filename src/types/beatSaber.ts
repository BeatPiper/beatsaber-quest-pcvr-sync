export interface BeatSaberPlaylist {
  playlistTitle: string;
  playlistAuthor: string;
  playlistDescription: string;
  syncURL?: string;
  image: string | null;
  songs: BeatSaberPlaylistSong[];
}

export interface BeatSaberPlaylistFile {
  fileName: string;
  playlist: BeatSaberPlaylist;
}

export interface BeatSaberPlaylistSong {
  uploader: string;
  name: string;
  key: string;
  hash: string;
}
