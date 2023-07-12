import { Util } from '@dgx/client';

const trackIds: Record<string, ((data?: any) => void) | null> = {};

export const generateTrackId = () => {
  let id = Util.uuidv4();
  while (trackIds[id]) {
    id = Util.uuidv4();
  }
  trackIds[id] = null;
  return id;
};

export const registerTrackId = (id: string): Promise<any> => {
  return new Promise(res => {
    trackIds[id] = res;
  });
};

export const resolveId = (id: string, data?: any) => {
  if (!trackIds[id]) return;
  trackIds[id]?.(data);
};
