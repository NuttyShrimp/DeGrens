import React from 'react';
import { compose, connect } from '@lib/redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Gallery } from './components/gallery';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Gallery.Props, any> {
  fetchImages = async () => {
    const imgs = await nuiAction('phone/gallery/get', {}, devData.images);
    this.props.updateState({
      list: imgs,
    });
  };

  componentDidMount() {
    this.fetchImages();
  }

  render() {
    return (
      <AppContainer>
        <Gallery {...this.props} fetchImages={this.fetchImages} />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
