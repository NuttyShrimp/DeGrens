const overwrites: Record<string, any> = {};

global.exports('setOverwrite', (key: string, value: any) => {
  if (overwrites[key] !== undefined) {
    console.log(`[Overwrite] Overwriting ${key} with ${value}`);
  }
  overwrites[key] = value;
});

global.exports('getOverwrite', (key: string) => {
  return overwrites[key];
});

global.exports('deleteOverwrite', (key: string) => {
  delete overwrites[key];
});
