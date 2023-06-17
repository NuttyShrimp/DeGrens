import { FC } from 'react';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { showLoadModal } from '@src/main/phone/lib';

export const UserPayModal: FC<{
  citizenid?: number;
  onSubmit: (citizenid: number, amount: number, comment: string) => Promise<any>;
}> = ({ citizenid, onSubmit }) => {
  return (
    <SimpleForm
      elements={[
        {
          name: 'citizenid',
          render: props => <Input.Number {...props} label={'State ID'} min={1000} icon={'id-card'} />,
          defaultValue: String(citizenid),
        },
        {
          name: 'amount',
          render: props => <Input.Number {...props} label={'Prijs'} icon={'euro-sign'} />,
          defaultValue: '0',
        },
        {
          name: 'comment',
          render: props => <Input.TextField {...props} label={'Opmerking'} icon={'comment'} />,
        },
      ]}
      onAccept={async (vals: { citizenid: string; amount: string; comment: string }) => {
        showLoadModal();
        await onSubmit(Number(vals.citizenid), Number(vals.amount), vals.comment);
      }}
    />
  );
};
