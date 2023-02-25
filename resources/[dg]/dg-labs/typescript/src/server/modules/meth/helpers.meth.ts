export const generateRecipe = (cid: number) => {
  const recipe: {
    power: number;
    amount: number;
  }[] = [];

  for (let i = 0; i < 5; i++) {
    const power = getSeededNumber(cid * (10 + i));
    const amount = getSeededNumber(cid * (10 + i) * 2);

    recipe.push({
      power: Math.round(power * 100),
      amount: Math.round(amount * 100),
    });
  }

  return recipe;
};

const getSeededNumber = (seed: number) => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const map = (x: number, orgMin: number, orgMax: number, finMin: number, finMax: number) => {
  return ((x - orgMin) * (finMax - finMin)) / (orgMax - orgMin + finMin);
};
