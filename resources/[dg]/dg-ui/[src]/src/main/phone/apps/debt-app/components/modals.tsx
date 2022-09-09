import React, { FC, useState } from 'react';
import { InputAdornment } from '@mui/material';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { nuiAction } from '@src/lib/nui-comms';
import { showCheckmarkModal, showLoadModal } from '@src/main/phone/lib';

export const PayModal: FC<{ debt: Phone.Debt.Debt }> = ({ debt }) => {
  const [percentage, setPercentage] = useState('100');
  const changePerc = (perct: string) => {
    const perc = Number(perct);
    if (perc > 100) {
      setPercentage('100');
    } else if (perc < 1) {
      setPercentage('1');
    } else {
      setPercentage(String(perc));
    }
  };
  return (
    <SimpleForm
      header={'Pay debt'}
      elements={[
        {
          name: 'percentage',
          defaultValue: '100',
          required: true,
          render: props => (
            <Input.Number
              {...props}
              min={debt.debt - debt.payed < 1000 ? 100 : 1}
              max={100}
              value={percentage}
              onChange={changePerc}
              InputProps={{
                endAdornment: <InputAdornment position='end'>%</InputAdornment>,
              }}
              label={'percentage'}
            />
          ),
        },
        {
          name: 'total',
          defaultValue: String(100 * (debt.debt - debt.payed)),
          render: props => (
            <Input.Number
              {...props}
              value={((debt.debt - debt.payed) * (Number(percentage) / 100)).toFixed(2)}
              disabled
              InputProps={{
                startAdornment: <InputAdornment position='start'>€</InputAdornment>,
              }}
              label={'amount'}
            />
          ),
        },
      ]}
      onAccept={async () => {
        showLoadModal();
        await nuiAction(`phone/debts/pay`, {
          id: debt.id,
          percentage: Number(percentage),
        });
        showCheckmarkModal();
      }}
    />
  );
};
