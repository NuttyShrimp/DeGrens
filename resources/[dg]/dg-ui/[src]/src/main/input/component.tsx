import React, { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { InputMenu } from './component/inputMenu';
import config from './_config';

import './styles/inputs.scss';

const Component: AppFunction = props => {
  const [inputs, setInputs] = useState<InputMenu.Input[]>([]);
  const [header, setHeader] = useState('');
  const [callbackURL, setCallbackURL] = useState('');

  const onShow = useCallback((data: Partial<InputMenu.Data>) => {
    data.inputs = data.inputs ?? [];

    // Validate select input options
    data.inputs.forEach(i => {
      if (i.type !== 'select') return;
      if (!i.options || i.options.length === 0) throw new Error('No options provided for select input');
      i.options.forEach(o => {
        if (!o.value) throw new Error('No option value provided for select input');
        if (!o.label) throw new Error('No option label provided for select input');
      });
    });

    setInputs(
      data.inputs.map(i => {
        if (!i.value) i.value = '';
        return i;
      })
    );
    setHeader(data.header ?? '');
    setCallbackURL(data.callbackURL ?? '');

    props.showApp();
  }, []);

  const onHide = useCallback(() => {
    props.hideApp();
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={onShow} onHide={onHide} full center>
      <InputMenu inputs={inputs} header={header} callbackURL={callbackURL} />
    </AppWrapper>
  );
};

export default Component;
