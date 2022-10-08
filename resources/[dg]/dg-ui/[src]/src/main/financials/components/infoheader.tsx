import React, { FC } from 'react';

import { NumberFormat } from '../../../components/numberformat';

export const Infoheader: FC<
  React.PropsWithChildren<{
    bank: string;
    cash: number;
  }>
> = props => {
  return (
    <div className={'financials__header'}>
      <div>
        <i className={'fas fa-university'} />
        <span>{` ${props.bank.charAt(0).toUpperCase()}${props.bank.slice(1)}`}</span>
      </div>
      <div>
        <span>
          cash: €<NumberFormat.Bank value={props.cash} />
        </span>
      </div>
    </div>
  );
};
