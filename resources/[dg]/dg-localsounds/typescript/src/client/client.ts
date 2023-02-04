import { Sounds, Util } from '@dgx/client';

let volumeModifier = 0.5;

const playSound = (soundName: string, volume: number) => {
  if (!LocalPlayer.state.isLoggedIn) return;

  SendNUIMessage({
    action: 'playSound',
    soundName,
    soundVolume: volume * volumeModifier,
  });
};

onNet('localsounds:play', playSound);
global.exports('playSound', playSound);

const setSoundModifier = (preferences: any) => {
  const volume = preferences?.sounds?.interactionSoundVolume;
  if (volume === undefined) return;
  volumeModifier = Math.round(volume) / 100;
};

Util.onPreferenceChange(setSoundModifier);

setImmediate(() => {
  const preferences = Util.getPreferences();
  setSoundModifier(preferences);
});

RegisterCommand(
  'st',
  (src: number, args: string[]) => {
    const soundName = args[0];
    const soundVolume = Number(args[1]);
    Sounds.playLocalSound(soundName, soundVolume);
  },
  false
);
