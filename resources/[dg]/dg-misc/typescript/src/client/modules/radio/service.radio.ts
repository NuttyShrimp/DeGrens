import { Animations, Events, PropAttach, UI, Util } from '@dgx/client';

let radioEnabled = false;
let frequency = LocalPlayer?.state?.radioChannel ?? 0;
let allowedFreq: { pd: boolean; normal: boolean };

let playingAnimation = false;
let radioPropId: number | null = null;
let radioAnimLoopId: number | null = null;

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

  playingAnimation = true;
  radioPropId = PropAttach.add('radio');
  radioAnimLoopId = Animations.startAnimLoop({
    animation: {
      dict: isInVehicle ? 'anim@cellphone@in_car@ps' : 'cellphone@',
      name: 'cellphone_text_in',
      flag: 50,
    },
    weight: 15,
  });
};

export const stopRadioAnimation = () => {
  playingAnimation = false;

  if (radioPropId !== null) {
    PropAttach.remove(radioPropId);
    radioPropId = null;
  }

  if (radioAnimLoopId !== null) {
    Animations.stopAnimLoop(radioAnimLoopId);
    radioAnimLoopId = null;
  }
};
