import React, { FC } from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';

export const SellModal: FC<{ vin: string; name: string }> = props => {
  return (
    <SimpleForm
      header={`${props.name}`}
      elements={[
        {
          name: 'cid',
          render: props => <Input.Number {...props} min={1000} label={'CitizenID'} icon={'id-card'} />,
        },
        {
          name: 'price',
          render: props => <Input.Number {...props} label={'Prijs'} icon={'euro-sign'} />,
        },
      ]}
      onAccept={vals => {
        nuiAction('phone/garage/sell', {
          ...vals,
          vin: props.vin,
        });
      }}
    />
  );
};
