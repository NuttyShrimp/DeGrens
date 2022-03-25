import React, { FC } from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal } from '../../../lib';

export const NewAd: FC<{ onAccept: Function; ad: Phone.YellowPages.Ad | null }> = props => (
  <SimpleForm
    header='Nieuwe advertentie'
    elements={[
      {
        name: 'text',
        render: props => <Input.TextField {...props} icon={'text'} />,
        defaultValue: props?.ad?.text ?? '',
      },
    ]}
    onAccept={vals => {
      if (vals.text.trim() === '') {
        nuiAction('phone/yellowpages/remove');
      } else {
        nuiAction('phone/yellowpages/new', vals);
      }
      showCheckmarkModal(props.onAccept);
    }}
  />
);
