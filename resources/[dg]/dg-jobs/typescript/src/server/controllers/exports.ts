// Get current job where this player is on duty for
// This export can be seen as a hasJob and onDuty check combined
import { getPlayerJob } from '../services/signin';
import { getPlayerInfoForJob, hasSpeciality } from '../services/whitelist';

global.exports('getCurrentJob', (src: number) => {
  const job = getPlayerJob(src);
  if (!job) return null;
  return job;
});
global.exports('getCurrentGrade', (src: number) => {
  const job = getPlayerJob(src);
  if (!job) return 0;
  const info = getPlayerInfoForJob(src, job);
  if (!info) return 0;
  return info.rank;
});
global.exports('hasSpeciality', (src: number, speciality: string) => {
  return hasSpeciality(src, speciality);
});
// See this as a check if a player can sign in to this job
global.exports('isWhitelisted', (src: number, job: string) => {
  return !!getPlayerInfoForJob(src, job);
});
