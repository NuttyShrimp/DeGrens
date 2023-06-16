import { ChangeEvent, useState } from 'react';
import RadioPng from '@assets/radio/radio.png';
import { Tooltip } from '@mui/material';

import { nuiAction } from '../../../lib/nui-comms';
import { useRadioStore } from '../stores/useRadioStore';

export const Radio = () => {
  const [enabled, frequency, updateStore] = useRadioStore(s => [s.enabled, s.frequency, s.updateStore]);
  const [freq, setFreq] = useState<string>(String(frequency ?? 0));
  const handleFreqChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.currentTarget.value;
    const newFreq = Number(val);
    if (!newFreq || Number.isNaN(val) || newFreq < 0 || (newFreq !== 0 && newFreq < 1)) {
      return setFreq('0');
    }
    if (newFreq > 999.9) {
      return setFreq('999.9');
    }
    if (val.includes('.') && val.split('.')[1].length > 1) {
      val = Number(val).toFixed(1);
    }
    setFreq(val);
  };

  const toggleRadio = () => {
    nuiAction('radio/toggle', {
      toggle: !enabled,
    });
    updateStore({
      enabled: !enabled,
    });
  };

  const setChannel = () => {
    nuiAction('radio/setFrequency', {
      frequency: freq,
    });
  };

  return (
    <>
      <div className={'radio-img'}>
        <img src={RadioPng} alt={'photo of radio'} />
      </div>
      <div className={'radio-freq'}>
        {enabled ? <input value={freq} onChange={handleFreqChange} onBlur={setChannel} /> : <p>Off</p>}
      </div>
      <div className={'radio-toggle'}>
        <Tooltip title={enabled ? 'Switch off' : 'Switch on'} placement={'left'} arrow>
          <div className={'fill'} onClick={toggleRadio} />
        </Tooltip>
      </div>
    </>
  );
};
