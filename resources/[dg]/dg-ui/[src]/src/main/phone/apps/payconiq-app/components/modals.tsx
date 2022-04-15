import React from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { genericAction, showCheckmarkModal, showLoadModal } from '../../../lib';

export const TransactionModal = () => (
  <SimpleForm
    elements={[
      {
        name: 'target',
        render: props => <Input.Contact {...props} />,
      },
      {
        name: 'amount',
        render: props => <Input.Number {...props} label={'Amount'} icon={'euro-sign'} />,
      },
      {
        name: 'comment',
        render: props => <Input.TextField {...props} label={'Opmerking'} icon={'comment'} />,
      },
    ]}
    onAccept={vals => {
      showLoadModal();
      // TODO: move endpoint to financials script after financials UI has been moved to this
      nuiAction('phone/payconiq/makeTransaction', vals);
      showCheckmarkModal(() => {
        genericAction('phone.apps.payconiq', { dirty: true });
      });
    }}
  />
);
