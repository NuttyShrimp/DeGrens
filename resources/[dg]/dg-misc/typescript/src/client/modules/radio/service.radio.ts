import { Events, Inventory, UI } from '@dgx/client';

let radioEnabled = false;
let frequency = LocalPlayer?.state?.radioChannel ?? 0;
let allowedFreq: { pd: boolean; normal: boolean };

export const openRadio = (freq: number, allowed: { pd: boolean; normal: boolean }) => {
  frequency = freq;
  allowedFreq = allowed;
  UI.openApplication('radio', {
    frequency,
    enabled: radioEnabled,
  });
};

export const toggleRadio = (toggle: boolean) => {
  global.exports['pma-voice'].setRadioChannel(toggle ? frequency : 0);
  global.exports['pma-voice'].setVoiceProperty('radioEnabled', toggle);
  radioEnabled = toggle;
};

export const setFreq = (freq: number) => {
  if (freq < 1 && freq !== 0) return;
  if (freq >= 1 && freq < 11) {
    if (!allowedFreq.pd) {
      freq = 0;
      PlaySoundFromEntity(-1, 'error_sound', PlayerPedId(), 'DLC_NUTTY_SOUNDS', false, 5.0);
      return;
    }
  } else if (freq !== 0 && !allowedFreq.normal) {
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
