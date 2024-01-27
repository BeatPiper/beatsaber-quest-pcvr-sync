import { DeviceClient, Sync } from '@u4/adbkit';
import { LocalPlayer, PlayerData } from '../types/playerData';
import { PLAYERDATA_PATH_QUEST, SONGS_PATH_QUEST, TEMP_PLAYERDATA_PATH_QUEST } from '../constants';
import fs from 'fs';
import chalk from 'chalk';
import { streamToString, stringToStream } from '../utils/streams';
import { getPlayerDataPath } from '../utils/pcPaths';

export function getPcPlayerData(configPath: string): PlayerData {
  const data = fs.readFileSync(getPlayerDataPath(configPath), 'utf8');
  return JSON.parse(data.trim());
}

export function updatePcPlayerData(configPath: string, playerData: PlayerData) {
  fs.writeFileSync(getPlayerDataPath(configPath), JSON.stringify(playerData), 'utf8');
}

export async function getQuestPlayerData(sync: Sync): Promise<PlayerData> {
  const favorites = await sync.pull(PLAYERDATA_PATH_QUEST);
  const data = await streamToString(favorites);
  return JSON.parse(data.trim());
}

export async function updateQuestPlayerData(sync: Sync, playerData: PlayerData, client: DeviceClient) {
  const data = stringToStream(JSON.stringify(playerData));
  await sync.push(data, PLAYERDATA_PATH_QUEST);
  await client.exec(`rm -rf '${TEMP_PLAYERDATA_PATH_QUEST}'`);
}

export function getLocalPlayer(playerData: PlayerData): LocalPlayer {
  if (!playerData?.localPlayers?.length) {
    console.log(chalk.red('No local players found in PlayerData.dat'));
    process.exit(1);
  }
  // TODO: handle multiple local players with a prompt
  return playerData.localPlayers[0];
}
