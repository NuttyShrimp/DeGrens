import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { Paper } from '../../../../../components/paper';
import { formatRelativeTime } from '../../../../../lib/util';
import { showFormModal } from '../../../lib';
import { AppContainer } from '../../../os/appcontainer/appcontainer';

import { TransactionModal } from './modals';
import { styles } from './payconiq.styles';

export const Payconiq: FC<React.PropsWithChildren<Phone.PayConiq.Props>> = props => {
  const characterState = useSelector<RootState, Character>(s => s.character);
  const classes = styles();
  return (
    <AppContainer
      primaryActions={[
        {
          title: 'Schrijf over',
          icon: 'hand-holding-usd',
          onClick: () => showFormModal(<TransactionModal />),
        },
      ]}
      emptyList={props.list.length === 0}
    >
      {props.list.map(t => {
        const incoming = t.accepted_by === characterState.firstname + ' ' + characterState.lastname;
        return (
          <Paper
            key={t.transaction_id}
            title={
              <div className={classes.transTitle}>
                <div className={incoming ? 'green' : 'red'}>€{t.change}</div>
                <div>{incoming ? t.triggered_by : t.accepted_by}</div>
              </div>
            }
            description={<div>{formatRelativeTime(t.date)}</div>}
          />
        );
      })}
    </AppContainer>
  );
};
