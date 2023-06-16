import { FC } from 'react';
import * as React from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal, showLoadModal } from '../../../lib';

export const NewAd: FC<React.PropsWithChildren<{ onAccept: Function; ad: Phone.YellowPages.Ad | null }>> = props => (
  <SimpleForm
    header='Nieuwe advertentie'
    elements={[
      {
        name: 'text',
        render: props => <Input.TextField {...props} icon={'text'} />,
        defaultValue: props?.ad?.text ?? '',
        required: false,
      },
    ]}
    onAccept={vals => {
      showLoadModal();
      if (!vals.text || vals.text.trim() === '') {
        nuiAction('phone/yellowpages/remove');
      } else {
        nuiAction('phone/yellowpages/new', vals);
      }
      showCheckmarkModal(props.onAccept);
    }}
  />
);
