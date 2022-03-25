import React from 'react';
import { compose, connect } from '@lib/redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Justice } from './components/justice';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: s => ({
    character: s.character,
  }),
  mapDispatchToProps: {},
});

const whitelistedJobs = ['judge', 'lawyer'];

class Component extends React.Component<Phone.Justice.Props & { character: CharacterData }, any> {
  constructor(props) {
    super(props);
    this.state = {
      available: false,
    };
  }

  async fetchList() {
    const list = await nuiAction('phone/justice/get', {}, devData.justice);
    this.props.updateState({
      list,
    });
    this.getAvailability();
  }

  getAvailability() {
    let isAvail = false;
    if (Object.keys(this.props.list).includes(this.props.character.job)) {
      isAvail =
        this.props.list[this.props.character.job].find(p => p.phone === this.props.character.phone)?.available ?? false;
    }
    this.setState({
      available: isAvail,
    });
  }

  componentDidMount() {
    this.fetchList();
  }

  render() {
    return (
      <AppContainer
        primaryActions={
          whitelistedJobs.includes(this.props.character.job)
            ? this.state.available === true
              ? [
                  {
                    title: 'Zet onbeschikbaar',
                    icon: 'handshake-slash',
                    onClick: async () => {
                      await nuiAction('phone/justice/setAvailable', {
                        available: false,
                      });
                      await this.fetchList();
                    },
                  },
                ]
              : [
                  {
                    title: 'Zet beschikbaar',
                    icon: 'handshake',
                    onClick: async () => {
                      await nuiAction('phone/justice/setAvailable', {
                        available: true,
                      });
                      await this.fetchList();
                    },
                  },
                ]
            : []
        }
      >
        <Justice {...this.props} />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
