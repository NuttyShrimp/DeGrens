const maxCoord = 16384;
const shifts: Record<number, number> = {};
for (let i = 0; i < Math.log2(maxCoord) + 1; i++) {
  shifts[1 << i] = Math.log2(maxCoord / (1 << i)) + 1;
}

const getGridChunk = (coord: number, chunk_size: number) => {
  return Math.floor((coord + maxCoord) / chunk_size);
};

export const getChunkForPos = (pos: Vec2, chunk_size = 256) => {
  const chunk = {
    x: getGridChunk(pos.x, chunk_size),
    y: getGridChunk(pos.y, chunk_size),
  };
  return (chunk.x << shifts[chunk_size]) | chunk.y;
};

export const getMaxChunks = (radius: number) => {
  return getChunkForPos({ x: maxCoord - radius, y: maxCoord - radius }, radius);
};
