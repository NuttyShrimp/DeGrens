import { useMainStore } from '@src/lib/stores/useMainStore';

import { Paper } from '../../../../../components/paper';
import { formatRelativeTime } from '../../../../../lib/util';
import { showFormModal } from '../../../lib';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { usePayconiqAppStore } from '../stores/usePayconiqAppStore';

import { TransactionModal } from './modals';
import { styles } from './payconiq.styles';

export const Payconiq = () => {
  const charName = useMainStore(s => s.character.firstname + ' ' + s.character.lastname);
  const list = usePayconiqAppStore(s => s.list);
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
      emptyList={list.length === 0}
    >
      {list.map(t => {
        const incoming = t.accepted_by === charName;
        return (
          <Paper
            key={t.transaction_id}
            title={
              <div className={classes.transTitle}>
                <div className={incoming ? 'green' : 'red'}>€{t.origin_change}</div>
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
