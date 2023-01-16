import React, { FC } from 'react';

import { Icon } from '../../../../../components/icon';
import { Paper } from '../../../../../components/paper';
import { nuiAction } from '../../../../../lib/nui-comms';
import { copyToClipboard } from '../../../../../lib/util';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { useGalleryAppStore } from '../stores/useGalleryAppStore';

export const Gallery: FC<{
  fetchImages: () => Promise<void>;
}> = props => {
  const list = useGalleryAppStore(s => s.list);
  return (
    <AppContainer>
      {list.map(i => (
        <Paper
          image={<Icon name={i.link} lib={'img'} />}
          key={i.id}
          actions={[
            {
              icon: 'trash',
              title: 'Delete',
              onClick: async () => {
                await nuiAction('phone/gallery/delete', { id: i.id });
                props.fetchImages();
              },
            },
            {
              icon: 'clipboard',
              title: 'Copy',
              onClick: () => {
                copyToClipboard(i.link);
              },
            },
          ]}
        />
      ))}
    </AppContainer>
  );
};
