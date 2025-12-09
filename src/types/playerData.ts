export interface PlayerData {
  version: string;
  localPlayers: LocalPlayer[];
  guestPlayers: unknown[]; // TODO: figure out what this is
}

export interface LocalPlayer {
  playerId: string;
  playerName: string;
  shouldShowTutorialPrompt: boolean;
  shouldShow360Warning: boolean;
  agreedToEula: boolean;
  didSelectLanguage: boolean;
  agreedToMultiplayerDisclaimer: boolean;
  avatarCreated: boolean;
  didSelectRegionVersion: number;
  playerAgreements: PlayerAgreements;
  lastSelectedBeatmapDifficulty: number;
  lastSelectedBeatmapCharacteristicName: BeatmapCharacteristicName;
  gameplayModifiers: GameplayModifiers;
  playerSpecificSettings: PlayerSpecificSettings;
  practiceSettings: PracticeSettings;
  playerAllOverallStatsData: PlayerAllOverallStatsData;
  levelsStatsData: LevelsStatsData[];
  missionsStatsData: MissionsStatsData[];
  showedMissionHelpIds: string[];
  colorSchemesSettings: ColorSchemesSettings;
  overrideEnvironmentSettings: OverrideEnvironmentSettings;
  favoritesLevelIds: string[];
  multiplayerModeSettings: MultiplayerModeSettings;
  currentDlcPromoDisplayCount: number;
  currentDlcPromoId: string;
}

export interface ColorSchemesSettings {
  overrideDefaultColors: boolean;
  selectedColorSchemeId: string;
  colorSchemes: ColorScheme[];
}

export interface ColorScheme {
  colorSchemeId: string;
  saberAColor: EnvironmentColor;
  saberBColor: EnvironmentColor;
  environmentColor0: EnvironmentColor;
  environmentColor1: EnvironmentColor;
  obstaclesColor: EnvironmentColor;
  environmentColor0Boost: EnvironmentColor;
  environmentColor1Boost: EnvironmentColor;
}

export interface EnvironmentColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GameplayModifiers {
  energyType: number;
  instaFail: boolean;
  failOnSaberClash: boolean;
  enabledObstacleType: number;
  fastNotes: boolean;
  strictAngles: boolean;
  disappearingArrows: boolean;
  ghostNotes: boolean;
  noBombs: boolean;
  songSpeed: number;
  noArrows: boolean;
  noFailOn0Energy: boolean;
  proMode: boolean;
  zenMode: boolean;
  smallCubes: boolean;
}

export enum BeatmapCharacteristicName {
  NoArrows = 'NoArrows',
  OneSaber = 'OneSaber',
  Standard = 'Standard',
  The360Degree = '360Degree',
  The90Degree = '90Degree',
}

export interface LevelsStatsData {
  levelId: string;
  difficulty: number;
  beatmapCharacteristicName: BeatmapCharacteristicName;
  highScore: number;
  maxCombo: number;
  fullCombo: boolean;
  maxRank: number;
  validScore: boolean;
  playCount: number;
}

export interface MissionsStatsData {
  missionId: string;
  cleared: boolean;
}

export interface MultiplayerModeSettings {
  createServerNumberOfPlayers: number;
  quickPlayDifficulty: string;
  quickPlaySongPackMask: unknown[]; // TODO: figure out what this is
  quickPlaySongPackMaskSerializedName: string;
  quickPlayEnableLevelSelection: boolean;
}

export interface OverrideEnvironmentSettings {
  overrideEnvironments: boolean;
  overrideNormalEnvironmentName: string;
  override360EnvironmentName: string;
}

export interface PlayerAgreements {
  eulaVersion: number;
  privacyPolicyVersion: number;
  healthAndSafetyVersion: number;
}

export interface PlayerAllOverallStatsData {
  campaignOverallStatsData: { [key: string]: number };
  soloFreePlayOverallStatsData: { [key: string]: number };
  partyFreePlayOverallStatsData: { [key: string]: number };
  onlinePlayOverallStatsData: { [key: string]: number };
}

export interface PlayerSpecificSettings {
  staticLights: boolean;
  leftHanded: boolean;
  playerHeight: number;
  automaticPlayerHeight: boolean;
  sfxVolume: number;
  reduceDebris: boolean;
  noTextsAndHuds: boolean;
  advancedHud: boolean;
  saberTrailIntensity: number;
  _noteJumpDurationTypeSettingsSaveData: number;
  noteJumpFixedDuration: number;
  autoRestart: boolean;
  noFailEffects: boolean;
  noteJumpBeatOffset: number;
  hideNoteSpawnEffect: boolean;
  adaptiveSfx: boolean;
  environmentEffectsFilterDefaultPreset: number;
  environmentEffectsFilterExpertPlusPreset: number;
}

export interface PracticeSettings {
  startSongTime: number;
  songSpeedMul: number;
}
