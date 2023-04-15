import React, { useCallback, useState } from 'react';
import AppWrapper, { closeApplication } from '@components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';

import { Keypad } from './components/keypad';
import config from './_config';

import './styles/keypad.scss';

const Component: AppFunction = props => {
  const [id, setId] = useState<string>('');
  const [buttons, setButtons] = useState([...new Array(10)].map(() => ''));
  const [inputs, setInputs] = useState<string[]>([]);

  const onShow = useCallback((data: Keypad.OpeningData) => {
    if (!data.buttons || data.buttons.length !== 10) {
      console.log('Provided buttons array did not contain 10 options');
      return;
    }

    setId(data.id);
    setButtons(data.buttons);
    props.showApp();
  }, []);

  const onHide = useCallback(() => {
    props.hideApp();
  }, []);

  const finishInput = () => {
    nuiAction('keypad/finish', { id, inputs });
    setInputs([]);
    closeApplication('keypad');
  };

  return (
    <AppWrapper appName={config.name} onShow={onShow} onHide={onHide} full center>
      <Keypad buttons={buttons} setInputs={setInputs} finishInput={finishInput} />
    </AppWrapper>
  );
};

export default Component;
