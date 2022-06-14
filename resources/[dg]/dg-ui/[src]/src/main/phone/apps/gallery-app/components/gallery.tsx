import React, { FC } from 'react';

import { Icon } from '../../../../../components/icon';
import { Paper } from '../../../../../components/paper';
import { nuiAction } from '../../../../../lib/nui-comms';
import { copyToClipboard } from '../../../../../lib/util';
import { AppContainer } from '../../../os/appcontainer/appcontainer';

export const Gallery: FC<
  Phone.Gallery.State & {
    fetchImages: () => Promise<void>;
  }
> = props => {
  return (
    <AppContainer>
      {props.list.map(i => (
        <Paper
          image={<Icon name={i.link} lib={'img'} />}
          key={i.id}
          actions={[
            {
              icon: 'trash',
              title: 'Delete',
              onClick: () => {
                nuiAction('phone/gallery/delete', { id: i.id });
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
