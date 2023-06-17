import { FC } from 'react';
import * as React from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal, showLoadModal } from '../../../lib';

export const TweetModal: FC<React.PropsWithChildren<{ text?: string; onAccept?: (data: any) => void }>> = props => (
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
      showLoadModal();
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
