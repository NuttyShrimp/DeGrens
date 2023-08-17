import { Util } from '@dgx/client';

export const generateKeygameSequence = () => {
  const sequence: {
    speed: number;
    size: number;
  }[] = [];

  const amountOfHardOnes = Util.getRndInteger(1, 4); // 1, 2 or 3 hardones
  const amountOfCycles = 8;

  const hardOnes = new Set<number>();
  while (hardOnes.size !== amountOfHardOnes) {
    let idx = Util.getRndInteger(0, amountOfCycles);
    hardOnes.add(idx);
  }

  for (let i = 0; i < amountOfCycles; i++) {
    if (hardOnes.has(i)) {
      sequence.push({
        speed: Util.getRndInteger(10, 14),
        size: 25,
      });
    } else {
      sequence.push({
        speed: Util.getRndInteger(1, 2),
        size: Util.getRndInteger(5, 7),
      });
    }
  }

  return sequence;
};
