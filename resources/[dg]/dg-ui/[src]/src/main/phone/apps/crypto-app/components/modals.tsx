import { FC } from 'react';
import * as React from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal, showLoadModal } from '../../../lib';
import { useCryptoAppStore } from '../stores/useCryptoAppStore';

const setDirty = () => {
  useCryptoAppStore.setState({ shouldRenew: true });
};

export const ExchangeModal: FC<React.PropsWithChildren<{ coin: Phone.Crypto.Coin }>> = ({ coin }) => (
  <SimpleForm
    elements={[
      {
        name: 'target',
        render: props => <Input.Contact {...props} icon={'mobile'} />,
      },
      {
        name: 'amount',
        render: props => <Input.Number {...props} min={0} max={coin.wallet.amount} label={'Amount'} icon={'coins'} />,
      },
    ]}
    onAccept={async (vals: { target: string; amount: string | number }) => {
      vals.amount = parseInt(vals.amount as string);
      if (vals.amount <= 0 || vals.amount > coin.wallet.amount || isNaN(vals.amount)) return;
      showLoadModal();
      await nuiAction('phone/crypto/transfer', { ...vals, coin: coin.crypto_name });
      showCheckmarkModal(setDirty);
    }}
  />
);

export const PurchaseModal: FC<React.PropsWithChildren<{ coin: Phone.Crypto.Coin }>> = ({ coin }) => (
  <SimpleForm
    elements={[
      {
        name: 'amount',
        render: props => <Input.Number {...props} min={0} label={'Amount'} icon={'coins'} />,
      },
    ]}
    onAccept={async (vals: { target: string; amount: string | number }) => {
      vals.amount = parseInt(vals.amount as string);
      if (vals.amount <= 0 || isNaN(vals.amount)) return;
      showLoadModal();
      await nuiAction('phone/crypto/purchase', { ...vals, coin: coin.crypto_name });
      showCheckmarkModal(setDirty);
    }}
  />
);
