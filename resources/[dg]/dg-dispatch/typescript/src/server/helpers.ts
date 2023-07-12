export const doesJobHaveDispatch = (job: string | null) => {
  return job === 'police' || job === 'ambulance';
};
