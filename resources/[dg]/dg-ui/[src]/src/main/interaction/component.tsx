import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { sanitizeText } from '../../lib/util';

import { Interaction } from './components/Interaction';
import store from './store';

import './styles/interaction.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Interaction.Props, any> {
  showInteraction = (data: { text: string; type: InteractionType }) => {
    this.props.updateState({
      visible: true,
      show: true,
      text: sanitizeText(
        (data.text ?? '').toUpperCase().replace(/\[.\]/, match => `<span class='shadow'>${match}</span>`)
      ),
      type: data.type,
    });
  };

  hideInteraction = () => {
    this.props.updateState({
      show: false,
    });
    // Animate out
    setTimeout(() => {
      this.props.updateState({
        visible: false,
        text: '',
        type: 'info',
      });
    }, 500);
  };

  render() {
    return (
      <AppWrapper appName={store.key} onShow={this.showInteraction} onHide={this.hideInteraction} full unSelectable>
        <Interaction {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
