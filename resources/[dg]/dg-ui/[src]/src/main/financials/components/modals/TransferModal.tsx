import React, { FC } from 'react';

import { Input } from '../../../../components/inputs';
import { SimpleForm } from '../../../../components/simpleform';
import { nuiAction } from '../../../../lib/nui-comms';
import { useFinancialsStore } from '../../stores/useFinancialsStore';

export const TransferModal: FC<React.PropsWithChildren<Financials.ModalProps>> = props => {
  const [closeModal, openLoadModal] = useFinancialsStore(s => [s.closeModal, s.openLoaderModal]);
  return (
    <SimpleForm
      header='Geld overschrijven'
      elements={[
        {
          name: 'amount',
          render: p => <Input.MoneyAmount {...p} label={'Amount'} icon={'dollar-sign'} />,
        },
        {
          name: 'target',
          render: p => (
            <Input.TextField {...p} label={'Target (CID, AccountID of Business Name)'} icon={'user-circle'} />
          ),
        },
        {
          name: 'comment',
          render: p => <Input.TextField {...p} label={'Comment'} icon={'comment-alt'} />,
        },
      ]}
      onAccept={async vals => {
        openLoadModal();
        await nuiAction('financials/account/transfer', {
          accountId: props.account.account_id,
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
