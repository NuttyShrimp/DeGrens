import { Sounds } from '@dgx/client';
import { getState } from './state';

const soundInfo: Record<string, { name: string; ids: number[] }> = {
  dial: {
    name: 'phone_dial',
    ids: [],
  },
  ring: {
    name: 'phone_ringtone',
    ids: [],
  },
};

export const playSound = (type: keyof typeof soundInfo, id: number) => {
  if (getState('isMuted')) return;
  const info = soundInfo[type];
  Sounds.playOnEntity(`phone_call_${type}_${id}`, info.name, 'DLC_NUTTY_SOUNDS', PlayerPedId());
  info.ids.push(id);
};

export const stopSound = (id: number) => {
  for (const [type, info] of Object.entries(soundInfo)) {
    if (info.ids.includes(id)) {
      Sounds.stop(`phone_call_${type}_${id}`);
      info.ids = info.ids.filter(i => i !== id);
    }
  }
};

export const stopAllSounds = () => {
  for (const [type, info] of Object.entries(soundInfo)) {
    for (const id of info.ids) {
      Sounds.stop(`phone_call_${type}_${id}`);
    }
    info.ids = [];
  }
};
