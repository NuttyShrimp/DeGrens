import React, { FC } from 'react';
import { Stack, Typography } from '@mui/material';
import { Button } from '@src/components/button';
import { List } from '@src/components/list';
import NumberFormat from '@src/components/numberformat';
import { Paper } from '@src/components/paper';
import { formatRelativeTime } from '@src/lib/util';
import { showFormModal } from '@src/main/phone/lib';

import { useDebtAppStore } from '../stores/useDebtAppStore';

import { MaintenanceEntry } from './maintenanceEntries';
import { PayPercentageModal } from './modals';

const DebtPaper: FC<{ debt: Phone.Debt.Debt }> = ({ debt }) => {
  const openPayModal = () => {
    showFormModal(<PayPercentageModal debt={debt} />);
  };
  return (
    <Paper
      title={debt.origin_name}
      image={'file-invoice-dollar'}
      description={
        <Stack direction={'row'} justifyContent='space-between' alignItems='flex-start'>
          <Typography variant='body2'>
            €<NumberFormat.Bank value={debt.debt} />
          </Typography>
          <Typography variant='body2'>{formatRelativeTime(debt.date * 1000)}</Typography>
        </Stack>
      }
      extDescription={
        <div>
          <List
            textSize={'.8rem'}
            items={[
              {
                icon: 'clipboard',
                label: `${debt.reason} - ${debt.target_account}`,
              },
              {
                icon: 'calendar-clock',
                label: formatRelativeTime(debt.date * 1000),
              },
              {
                icon: 'hand-holding-dollar',
                label: (
                  <span>
                    €<NumberFormat.Bank value={debt.payed} />
                  </span>
                ),
              },
              {
                icon: 'money-check-dollar-pen',
                label: (
                  <span>
                    €<NumberFormat.Bank value={debt.debt} />
                  </span>
                ),
              },
            ]}
          />
          <Stack mt={1} direction='row' justifyContent='space-between' alignItems='center'>
            <Button.Primary onClick={openPayModal}>Pay</Button.Primary>
          </Stack>
        </div>
      }
    />
  );
};

export const DebtList: FC<{}> = () => {
  const list = useDebtAppStore(s => s.list);
  return (
    <div>
      <Typography variant='subtitle1'>Debts</Typography>
      {list
        .filter(entry => entry.type === 'debt')
        .map(entry => (
          <MaintenanceEntry debt={entry} key={entry.id} />
        ))}
      <Typography variant='subtitle1'>Maintenance Fees</Typography>
      {list
        .filter(entry => entry.type === 'maintenance')
        .map(entry => (
          <DebtPaper key={entry.id} debt={entry} />
        ))}
    </div>
  );
};
