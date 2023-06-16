import { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Gallery } from './components/gallery';
import { useGalleryAppStore } from './stores/useGalleryAppStore';
const Component = () => {
  const [setList, listLen] = useGalleryAppStore(s => [s.setList, s.list.length]);
  const fetchImages = async () => {
    const imgs = await nuiAction('phone/gallery/get', {}, devData.images);
    setList(imgs);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <AppContainer emptyList={listLen === 0}>
      <Gallery fetchImages={fetchImages} />
    </AppContainer>
  );
};

export default Component;
