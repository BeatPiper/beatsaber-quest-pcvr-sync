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

export interface Song {
  _version: string;
  _songName: string;
  _songSubName: string;
  _songAuthorName: string;
  _levelAuthorName: string;
  _beatsPerMinute: number;
  _shuffle: number;
  _shufflePeriod: number;
  _previewStartTime: number;
  _previewDuration: number;
  _songFilename: string;
  _coverImageFilename: string;
  _environmentName: string;
  _songTimeOffset: number;
  _difficultyBeatmapSets: DifficultyBeatmapSet[];
  _allDirectionsEnvironmentName: string;
}

export interface DifficultyBeatmapSet {
  _beatmapCharacteristicName: string;
  _difficultyBeatmaps: DifficultyBeatmap[];
}

export interface DifficultyBeatmap {
  _difficulty: string;
  _difficultyRank: number;
  _beatmapFilename: string;
  _noteJumpMovementSpeed: number;
  _noteJumpStartBeatOffset: number;
}

export interface SongFile {
  folderName: string;
  song: Song;
}
