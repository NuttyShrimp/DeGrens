import { Events, Util } from '@dgx/client';
import { getChunkForPos } from '../../shared/helpers/grid';

let debugThread: NodeJS.Timer | null = null;

Events.onNet('dg-misc:grid:debug', (toggle: boolean, radius: number, nearby: number) => {
  if (debugThread) {
    clearInterval(debugThread);
    debugThread = null;
  }
  if (!toggle) return;
  const neighbourMods: Vec2[] = [];
  for (let x = -nearby; x <= nearby; x++) {
    for (let y = -nearby; y <= nearby; y++) {
      neighbourMods.push({ x, y });
    }
  }
  let chunkId = 0;
  let chunkCoords = { x: 0, y: 0 };
  debugThread = setInterval(() => {
    const pos = Util.getPlyCoords();
    const chunk = getChunkForPos(pos, radius);
    if (chunk !== chunkId) {
      console.log(`Leaving chunk ${chunkId} and entering chunk ${chunk}`);
      chunkId = chunk;
    }
    chunkCoords = {
      x: Math.floor(pos.x / radius) * radius,
      y: Math.floor(pos.y / radius) * radius,
    };
    neighbourMods.forEach(mod => {
      // Draw 4 lines in corners of chunk
      DrawLine(
        chunkCoords.x + mod.x * radius,
        chunkCoords.y + mod.y * radius,
        0,
        chunkCoords.x + mod.x * radius,
        chunkCoords.y + mod.y * radius,
        8096,
        0,
        255,
        0,
        255
      );
      DrawLine(
        chunkCoords.x + mod.x * (radius + radius),
        chunkCoords.y + mod.y * radius,
        0,
        chunkCoords.x + mod.x * (radius + radius),
        chunkCoords.y + mod.y * radius,
        8096,
        255,
        0,
        0,
        255
      );
      DrawLine(
        chunkCoords.x + mod.x * radius,
        chunkCoords.y + mod.y * (radius + radius),
        0,
        chunkCoords.x + mod.x * radius,
        chunkCoords.y + mod.y * (radius + radius),
        8096,
        255,
        0,
        0,
        255
      );
      DrawLine(
        chunkCoords.x + mod.x * (radius + radius),
        chunkCoords.y + mod.y * (radius + radius),
        0,
        chunkCoords.x + mod.x * (radius + radius),
        chunkCoords.y + mod.y * (radius + radius),
        8096,
        255,
        0,
        0,
        255
      );
    });
    DrawLine(chunkCoords.x, chunkCoords.y, 0, chunkCoords.x, chunkCoords.y, 8096, 0, 0, 255, 255);
  }, 1);
});

global.exports('getChunkForPos', getChunkForPos);
