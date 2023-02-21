import React from 'react';
import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Button } from '@src/components/button';
import { List } from '@src/components/list';
import { NumberFormat } from '@src/components/numberformat';
import { Paper } from '@src/components/paper';
import { formatRelativeTime } from '@src/lib/util';
import { showFormModal } from '@src/main/phone/lib';

import { PayModal } from './modals';

export const MaintenanceEntry = ({ debt }: { debt: Phone.Debt.Debt }) => {
  if (debt.reason.startsWith('veh_')) {
    return <VehicleEntry debt={debt} />;
  }
  return <BareEntry debt={debt} />;
};

const VehicleEntry = ({ debt }: { debt: Phone.Debt.Debt }) => {
  const openPayModal = () => {
    showFormModal(<PayModal debt={debt} />);
  };
  return (
    <Paper
      title={debt.origin_name}
      image={'vehicle'}
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
                icon: 'calendar-clock',
                label: formatRelativeTime(debt.date * 1000),
              },
              {
                icon: 'money-check-dollar-pen',
                label: (
                  <span>
                    €<NumberFormat.Bank value={debt.debt} />
                  </span>
                ),
              },
              {
                icon: 'barcode',
                label: debt.reason.replace('veh_', ''),
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

const BareEntry = ({ debt }: { debt: Phone.Debt.Debt }) => {
  const openPayModal = () => {
    showFormModal(<PayModal debt={debt} />);
  };
  return (
    <Paper
      title={debt.origin_name}
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
                icon: 'calendar-clock',
                label: formatRelativeTime(debt.date * 1000),
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
