import React, { FC } from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal } from '../../../lib';

export const TweetModal: FC<{ text?: string; onAccept?: (data: any) => void }> = props => (
  <SimpleForm
    header='Tweet'
    elements={[
      {
        name: 'tweet',
        render: props => <Input.TextField {...props} multiline icon={'twitter'} iconLib={'fab'} label={'Tweet'} />,
        defaultValue: props.text,
      },
    ]}
    onAccept={vals => {
      nuiAction('phone/twitter/new', {
        ...vals,
        date: Date.now(),
      });
      showCheckmarkModal(() => {
        if (props.onAccept) {
          props.onAccept(vals);
        }
      });
    }}
  />
);
