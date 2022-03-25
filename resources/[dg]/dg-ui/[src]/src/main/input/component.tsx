import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { InputMenu } from './component/inputMenu';
import store from './store';

import './styles/inputs.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<InputMenu.Props, any> {
  showInput = (data: Partial<InputMenu.State>) => {
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

    this.props.updateState({
      visible: true,
      ...data,
    });
  };

  hideInput = () => {
    this.props.updateState({
      visible: false,
      inputs: [],
      acceptCb: '',
    });
  };

  render() {
    return (
      <AppWrapper appName={store.key} onShow={this.showInput} onHide={this.hideInput} full center>
        <InputMenu {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
