import React from 'react';
import { compose, connect } from '@lib/redux';

import { nuiAction } from '../../../../lib/nui-comms';
import { genericAction, getState } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { InfoApp } from './components/infoapp';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Info.Props, any> {
  async refreshValues() {
    const info = await nuiAction('phone/info/fetchInfo');
    const newEntries: Phone.Info.InfoAppEntry[] = getState<Phone.Info.Props>('phone.apps.info').entries.map(
      (entry: Phone.Info.InfoAppEntry) => {
        if (info[entry.name]) {
          entry.value = info[entry.name];
        }
        return entry;
      }
    );
    genericAction('phone.apps.info', { entries: newEntries });
  }

  componentDidMount() {
    this.refreshValues();
  }

  render() {
    return (
      <AppContainer
        primaryActions={[
          {
            title: 'Refresh',
            onClick: () => this.refreshValues(),
            icon: 'sync-alt',
          },
        ]}
      >
        <InfoApp entries={this.props.entries} />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
