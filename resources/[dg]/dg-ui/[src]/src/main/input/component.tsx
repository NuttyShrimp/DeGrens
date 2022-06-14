import React from 'react';
import AppWrapper from '@components/appwrapper';

import { InputMenu } from './component/inputMenu';
import store from './store';

import './styles/inputs.scss';

const Component: AppFunction<InputMenu.State> = props => {
  const showInput = (data: Partial<InputMenu.State>) => {
    if (!data.inputs) {
      console.error('No inputs found');
      return null;
    }
    if (data.inputs.some(input => input.type === 'select')) {
      data.inputs
        .filter(input => input.type === 'select')
        .forEach(input => {
          if (!input.options) {
            console.error('No options given for select input');
            return null;
          }
          input.options.forEach(option => {
            if (!option.value) {
              console.error('No value given for select option');
              return null;
            }
            if (!option.label) {
              console.error('No label given for select option');
              return null;
            }
          });
        });
    }

    data.inputs = data.inputs.map(input => {
      if (!input.value) {
        input.value = '';
      }
      return input;
    });

    props.updateState({
      visible: true,
      ...data,
    });
  };

  const hideInput = () => {
    props.updateState({
      visible: false,
      inputs: [],
      callbackURL: '',
    });
  };

  return (
    <AppWrapper appName={store.key} onShow={showInput} onHide={hideInput} full center>
      <InputMenu {...props} />
    </AppWrapper>
  );
};

export default Component;
