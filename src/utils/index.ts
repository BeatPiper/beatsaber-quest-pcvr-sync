import path from 'path';
import { PLAYERDATA_FILE } from '../constants';

export const playerDataPath = (gamePath: string) => `${gamePath}${path.sep}${PLAYERDATA_FILE}`;

export const changeExtensionToBplist = (fileName: string) =>
  fileName.replace(/(_BMBF)?\.json$/, '.bplist');
export const changeExtensionToJson = (fileName: string) => fileName.replace(/\.bplist$/, '_BMBF.json');
