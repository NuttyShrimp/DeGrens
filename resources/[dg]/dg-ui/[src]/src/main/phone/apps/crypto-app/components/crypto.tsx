import React, { FC, MouseEvent } from 'react';

import { Button } from '../../../../../components/button';
import { List } from '../../../../../components/list';
import { Paper } from '../../../../../components/paper';
import { showFormModal } from '../../../lib';

import { styles } from './crypto.styles';
import { ExchangeModal, PurchaseModal } from './modals';

export const Crypto: FC<React.PropsWithChildren<Phone.Crypto.Props>> = props => {
  const classes = styles();
  const getCoinInfo = (coin: Phone.Crypto.Coin): ListItem[] => [
    {
      icon: 'tag',
      label: coin.crypto_name,
    },
    {
      icon: 'money-check-alt',
      label: String(coin.wallet.amount),
    },
    {
      icon: 'mi-assessment',
      label: `€${coin.value}`,
      size: '1.3rem',
    },
  ];
  const showPurchaseModal = (e: MouseEvent, coin: Phone.Crypto.Coin) => {
    e.stopPropagation();
    showFormModal(<PurchaseModal coin={coin} />);
  };
  const showExchangeModal = (e: MouseEvent, coin: Phone.Crypto.Coin) => {
    e.stopPropagation();
    showFormModal(<ExchangeModal coin={coin} />);
  };
  return (
    <div className={classes.list}>
      {props.list.map(c => (
        <Paper
          key={c.crypto_name}
          title={c.crypto_name}
          description={c.wallet.amount}
          image={c.icon}
          extDescription={
            <>
              <List items={getCoinInfo(c)} />
              <div className={'btnWrapper'}>
                {c.value !== 0 && (
                  <Button.Primary size={'small'} onClick={e => showPurchaseModal(e, c)}>
                    PURCHASE
                  </Button.Primary>
                )}
                <Button.Secondary size={'small'} onClick={e => showExchangeModal(e, c)}>
                  EXCHANGE
                </Button.Secondary>
              </div>
            </>
          }
        />
      ))}
    </div>
  );
};
