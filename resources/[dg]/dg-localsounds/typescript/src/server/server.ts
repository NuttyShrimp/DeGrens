global.exports('playSound', (plyId: number, soundName: string, volume: number) => {
  emitNet('localsounds:play', plyId, soundName, volume);
});
