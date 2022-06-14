import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Gallery } from './components/gallery';
const Component: AppFunction<Phone.Gallery.State> = props => {
  const fetchImages = async () => {
    const imgs = await nuiAction('phone/gallery/get', {}, devData.images);
    props.updateState({
      list: imgs,
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <AppContainer>
      <Gallery {...props} fetchImages={fetchImages} />
    </AppContainer>
  );
};

export default Component;
