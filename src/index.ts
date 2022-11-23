import Adb from '@u4/adbkit';
import chalk from 'chalk';
import inquirer from 'inquirer';
import Device from '@u4/adbkit/dist/models/Device';
import {
  getBeatSaberConfigPath,
  getPcPlayerData,
  getQuestPlayerData,
  getLocalPlayer,
  isValidBeatSaberConfigPath,
  updatePcPlayerData,
  updateQuestPlayerData,
} from './utils';
import { updateCustomConfigPath } from './settings';

// initialize pc
let beatSaberConfigPath = getBeatSaberConfigPath();
// validate path exists
if (!isValidBeatSaberConfigPath(beatSaberConfigPath)) {
  console.log(chalk.red(`Beat Saber config path ${beatSaberConfigPath} does not exist`));
  // ask for a new path
  const { customPath } = await inquirer.prompt<{
    customPath: string;
  }>([
    {
      type: 'input',
      name: 'customPath',
      message: 'Please enter the path to your Beat Saber config folder',
      validate: input => isValidBeatSaberConfigPath(input),
    },
  ]);
  beatSaberConfigPath = customPath;
  updateCustomConfigPath(customPath);
}

// initialize adb
const client = Adb.createClient();
const devices = await client.listDevices();

if (!devices.length) {
  console.log(
    chalk.red('No devices found, make sure you have a Quest connected and USB debugging enabled')
  );
  process.exit(1);
}

if (devices.length === 1) {
  await syncQuestAndPc(devices[0]);
} else {
  await chooseDevice();
}

/**
 * Choose an ADB device in case there are multiple
 */
async function chooseDevice() {
  const { device } = await inquirer.prompt<{
    device: Device;
  }>([
    {
      type: 'list',
      name: 'device',
      message: 'Found multiple devices, please choose one',
      choices: devices.map(device => ({
        name: device.id,
        value: device,
      })),
    },
  ]);
  await syncQuestAndPc(device);
}

/**
 * Bidirectional sync between Quest and PC
 */
async function syncQuestAndPc(device: Device) {
  console.log(chalk.green(`Syncing from ${device.id} to PC...`));

  const client = device.getClient();
  const sync = await client.syncService();

  // get player data from quest and pc
  // TODO: catch JSON parse errors
  const questPlayerData = await getQuestPlayerData(sync);
  const questLocalPlayer = getLocalPlayer(questPlayerData);

  const pcPlayerData = getPcPlayerData(beatSaberConfigPath);
  const pcLocalPlayer = getLocalPlayer(pcPlayerData);

  // TODO: make a backup of the player data before syncing and add an option to restore it

  // sync favorites
  const questFavorites = questLocalPlayer.favoritesLevelIds;
  const pcFavorites = pcLocalPlayer.favoritesLevelIds;

  // find favorites on quest that are not on pc
  const onlyOnQuest = questFavorites.filter(id => !pcFavorites.includes(id));
  // find favorites on pc that are not on quest
  const onlyOnPc = pcFavorites.filter(id => !questFavorites.includes(id));

  if (onlyOnQuest.length) {
    console.log(chalk.green(`Found ${onlyOnQuest.length} favorites that are on Quest but not on PC`));
    // ask if they want to remove them from quest or add them to pc
    const { action } = await inquirer.prompt<{
      action: 'pc' | 'quest';
    }>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do with these favorites?',
        choices: [
          {
            name: 'Add to PC',
            value: 'pc',
          },
          {
            name: 'Remove from Quest',
            value: 'quest',
          },
        ],
      },
    ]);
    if (action === 'pc') {
      // add favorites to pc
      pcLocalPlayer.favoritesLevelIds = [...pcFavorites, ...onlyOnQuest];
      updatePcPlayerData(beatSaberConfigPath, pcPlayerData);
    } else {
      // remove favorites from quest
      questLocalPlayer.favoritesLevelIds = onlyOnQuest;
      await updateQuestPlayerData(sync, questPlayerData);
    }
  }

  if (onlyOnPc.length) {
    console.log(chalk.green(`Found ${onlyOnPc.length} favorites that are on PC but not on Quest`));
    // ask if they want to add them to quest or remove them from pc
    const { action } = await inquirer.prompt<{
      action: 'pc' | 'quest';
    }>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do with these favorites?',
        choices: [
          {
            name: 'Add to Quest',
            value: 'quest',
          },
          {
            name: 'Remove from PC',
            value: 'pc',
          },
        ],
      },
    ]);
    if (action === 'quest') {
      // add favorites to quest
      questLocalPlayer.favoritesLevelIds = [...questFavorites, ...onlyOnPc];
      await updateQuestPlayerData(sync, questPlayerData);
    } else {
      // remove favorites from pc
      pcLocalPlayer.favoritesLevelIds = onlyOnPc;
      updatePcPlayerData(beatSaberConfigPath, pcPlayerData);
    }
  }

  // TODO: sync more player data?
}
