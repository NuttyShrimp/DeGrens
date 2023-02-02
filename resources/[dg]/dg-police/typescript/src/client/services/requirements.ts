let requirements: Police.Config['requirements'];

export const setRequirements = (config: typeof requirements) => {
  requirements = config;
};

global.exports('getRequirementForActivity', (activity: string) => {
  if (!(activity in requirements)) {
    throw new Error(`${activity} is not a known activity`);
  }

  return requirements[activity];
});
