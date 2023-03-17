import { Events, PropAttach, UI, Util } from '@dgx/client';

let radioEnabled = false;
let frequency = LocalPlayer?.state?.radioChannel ?? 0;
let allowedFreq: { pd: boolean; normal: boolean };

let playingAnimation = false;

export const openRadio = (freq: number, allowed: { pd: boolean; normal: boolean }) => {
  frequency = freq;
  allowedFreq = allowed;
  UI.openApplication('radio', {
    frequency,
    enabled: radioEnabled,
  });
  startRadioAnimation();
};

export const toggleRadio = (toggle: boolean, resetFrequency = false) => {
  global.exports['pma-voice'].setRadioChannel(toggle ? frequency : 0);
  global.exports['pma-voice'].setVoiceProperty('radioEnabled', toggle);
  radioEnabled = toggle;

  if (resetFrequency) {
    frequency = 0;
  }
};

// Allowed check is to bypass when using radialoptions before caching allowedfres
// shits gets checked on server anyway
export const setFreq = (freq: number, skipAllowedCheck = false) => {
  if (freq < 1 && freq !== 0) return;
  if (freq >= 1 && freq <= 10) {
    if (!skipAllowedCheck && !allowedFreq.pd) {
      freq = 0;
      PlaySoundFromEntity(-1, 'error_sound', PlayerPedId(), 'DLC_NUTTY_SOUNDS', false, 5.0);
      return;
    }
  } else if (freq !== 0 && !skipAllowedCheck && !allowedFreq.normal) {
    freq = 0;
    PlaySoundFromEntity(-1, 'error_sound', PlayerPedId(), 'DLC_NUTTY_SOUNDS', false, 5.0);
    return;
  }
  if (freq === frequency) return;
  frequency = freq;
  global.exports['pma-voice'].setRadioChannel(frequency);
  Events.emitNet('misc:radio:server:setFrequency', freq);
  if (!freq) return;
  global.exports['pma-voice'].playMicClicks(true);
  setTimeout(() => {
    global.exports['pma-voice'].playMicClicks(false);
  }, 110);
};

export const startRadioAnimation = async () => {
  if (playingAnimation) return;

  const ped = PlayerPedId();
  const isInVehicle = IsPedInAnyVehicle(ped, false);
  const animDict = isInVehicle ? 'anim@cellphone@in_car@ps' : 'cellphone@';
  const anim = 'cellphone_text_in';

  await Util.loadAnimDict(animDict);

  playingAnimation = true;
  const propId = PropAttach.add('radio');

  const thread = setInterval(() => {
    if (!playingAnimation) {
      PropAttach.remove(propId);
      StopAnimTask(ped, animDict, anim, 1);
      clearInterval(thread);
      return;
    }

    if (!IsEntityPlayingAnim(ped, animDict, anim, 3)) {
      TaskPlayAnim(ped, animDict, anim, 3.0, 3.0, -1, 50, 0, false, false, false);
    }
  }, 100);
};

export const stopRadioAnimation = () => {
  playingAnimation = false;
};
