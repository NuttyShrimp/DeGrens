import React from 'react';
import { compose, connect } from '@lib/redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { NewAd } from './components/modals';
import { YellowPages } from './components/yellowpages';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.YellowPages.Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      list: this.props.list,
    };
  }

  fetchListings = async () => {
    const listings = await nuiAction('phone/yellowpages/getList', {}, devData.YPListings);
    this.props.updateState({
      list: listings,
    });
    this.setState({
      list: listings,
    });
  };

  componentDidMount() {
    this.fetchListings();
  }

  render() {
    return (
      <AppContainer
        primaryActions={[
          {
            title: 'Nieuw',
            icon: 'ad',
            onClick: () => {
              showFormModal(<NewAd ad={this.props.current} onAccept={this.fetchListings} />);
            },
          },
        ]}
        search={{
          list: this.props.list,
          filter: ['phone', 'text', 'name'],
          onChange: value => {
            this.setState({
              list: value,
            });
          },
        }}
        emptyList={this.props.list.length === 0}
      >
        <YellowPages {...this.props} list={this.state.list} />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
