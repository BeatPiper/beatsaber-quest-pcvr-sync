export const changeExtensionToBplist = (fileName: string) =>
  fileName.replace(/(_BMBF)?\.json$/, '.bplist');
export const changeExtensionToJson = (fileName: string) => fileName.replace(/\.bplist$/, '_BMBF.json');

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
