import { Util } from '@dgx/server';

export const getRandomValidIdx = (arr: any[], checkCb: (idx: number) => boolean) => {
  const availableIds = Util.shuffleArray([...new Array(arr.length)].map((_, i) => i));
  while (availableIds.length > 0) {
    const idx = availableIds.pop();
    if (idx === undefined) return;
    if (!checkCb(idx)) continue;
    return idx;
  }
};
