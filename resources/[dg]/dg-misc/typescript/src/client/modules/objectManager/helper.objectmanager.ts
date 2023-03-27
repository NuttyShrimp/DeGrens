import { getMaxChunks } from '../../../shared/helpers/grid';

export const CHUNK_SIZE = 128;
export const RENDER_DISTANCE = 3;
export const MAX_CHUNK_ID = getMaxChunks(CHUNK_SIZE);

export const neighbourMods: Vec2[] = [];
for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
  for (let y = -RENDER_DISTANCE; y <= RENDER_DISTANCE; y++) {
    neighbourMods.push({ x: x * CHUNK_SIZE, y: y * CHUNK_SIZE });
  }
}
