export const isSameStance = (x: Stances.Stance, y: Stances.Stance): boolean => {
  return (
    x.frontLeft === y.frontLeft &&
    x.frontRight === y.frontRight &&
    x.backLeft === y.backLeft &&
    x.backRight === y.backRight
  );
};

export const getStanceFromPossibilities = (possibilities: Stances.Model['upgrade']['possibilities'], value: number) => {
  return possibilities.find(p => (Array.isArray(p.value) ? p.value.indexOf(value) !== -1 : p.value === value))?.stance;
};
