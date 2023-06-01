const hornSoundStore = new Map<number, number>();
const sirenSoundStore = new Map<number, number>();
const siren2SoundStore = new Map<number, number>();

const cleanupHornSound = (veh: number, soundId: number, scheduled = false) => {
  if (scheduled && DoesEntityExist(veh) && !IsEntityDead(veh)) return;
  StopSound(soundId);
  ReleaseSoundId(soundId);
  hornSoundStore.delete(veh);
};

const cleanupSirenSound = (veh: number, soundId: number, scheduled = false) => {
  if (scheduled && DoesEntityExist(veh) && !IsEntityDead(veh)) return;
  StopSound(soundId);
  ReleaseSoundId(soundId);
  sirenSoundStore.delete(veh);
};

const cleanupSiren2Sound = (veh: number, soundId: number, scheduled = false) => {
  if (scheduled && DoesEntityExist(veh) && !IsEntityDead(veh)) return;
  StopSound(soundId);
  ReleaseSoundId(soundId);
  siren2SoundStore.delete(veh);
};

export const doScheduledCleanup = () => {
  sirenSoundStore.forEach((soundId, veh) => cleanupSirenSound(veh, soundId, true));
  siren2SoundStore.forEach((soundId, veh) => cleanupSiren2Sound(veh, soundId, true));
  hornSoundStore.forEach((soundId, veh) => cleanupHornSound(veh, soundId, true));
};

export const toggleHornSound = (veh: number, play: boolean) => {
  const hornId = hornSoundStore.get(veh);
  if (hornId !== undefined) {
    cleanupHornSound(veh, hornId);
  }
  if (!play) return;

  const soundId = GetSoundId();
  hornSoundStore.set(veh, soundId);
  PlaySoundFromEntity(soundId, 'SIRENS_AIRHORN', veh, 0 as any, false, 0);
};

export const shuffleSirenSound = (veh: number, mode: number) => {
  let soundId = sirenSoundStore.get(veh);
  if (soundId) {
    cleanupSirenSound(veh, soundId);
  }
  if (mode === 0) return;
  soundId = GetSoundId();
  sirenSoundStore.set(veh, soundId);

  switch (mode) {
    case 1: {
      PlaySoundFromEntity(soundId, 'SIREN_1', veh, 'DLC_NUTTY_SIRENS', false, 0);
      break;
    }
    case 2: {
      PlaySoundFromEntity(soundId, 'SIREN_2', veh, 'DLC_NUTTY_SIRENS', false, 0);
      break;
    }
    case 3: {
      PlaySoundFromEntity(soundId, 'SIREN_3', veh, 'DLC_NUTTY_SIRENS', false, 0);
      break;
    }
    default: {
      cleanupSirenSound(veh, soundId);
    }
  }
};

export const shuffleSiren2Sound = (veh: number, mode: number) => {
  let soundId = siren2SoundStore.get(veh);
  if (soundId) {
    cleanupSiren2Sound(veh, soundId);
  }
  if (mode === 0) return;
  soundId = GetSoundId();
  siren2SoundStore.set(veh, soundId);

  PlaySoundFromEntity(soundId, 'SIREN_1', veh, 0 as any, false, 0);
};
