import React, { FC } from 'react';

import { Input } from '../../../../components/inputs';
import { SimpleForm } from '../../../../components/simpleform';
import { nuiAction } from '../../../../lib/nui-comms';
import { closeModal, openLoadModal } from '../../lib';

export const TransferModal: FC<React.PropsWithChildren<Financials.ModalProps>> = props => {
  return (
    <SimpleForm
      header='Geld overschrijven'
      elements={[
        {
          name: 'amount',
          render: props => <Input.MoneyAmount {...props} label={'Amount'} icon={'dollar-sign'} />,
        },
        {
          name: 'target',
          render: props => (
            <Input.MoneyAmount {...props} label={'Target (citizenid, accountid or businessid)'} icon={'user-circle'} />
          ),
        },
        {
          name: 'comment',
          render: props => <Input.TextField {...props} label={'Comment'} icon={'comment-alt'} />,
        },
      ]}
      onAccept={async vals => {
        openLoadModal();
        await nuiAction('financials/account/transfer', {
          accountId: props.selected.account_id,
          ...vals,
        });
        await props.fetchAccounts();
        await props.fetchTransactions(undefined, true);
        closeModal();
      }}
      onDecline={closeModal}
    />
  );
};
