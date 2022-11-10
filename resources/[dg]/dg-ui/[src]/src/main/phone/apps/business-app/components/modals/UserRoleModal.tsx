import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { showLoadModal } from '@src/main/phone/lib';

// TODO: fix defaultValue not being set for autocomplete inputs
export const UserModal: FC<{
  citizenid?: number;
  role?: string;
  onSubmit: (citizenid: number, role: string) => Promise<any>;
}> = ({ citizenid, role, onSubmit }) => {
  const roles = useSelector<RootState, Record<string, string[]>>(state => state['phone.apps.business'].roles);
  return (
    <SimpleForm
      elements={[
        {
          name: 'citizenid',
          render: props => <Input.Number {...props} label={'CID'} min={1000} icon={'id-card'} />,
          defaultValue: String(citizenid),
        },
        {
          name: 'role',
          render: props => (
            <Input.AutoComplete
              {...props}
              label={'Rol'}
              options={Object.keys(roles).map(r => ({ label: r, value: r }))}
            />
          ),
          defaultValue: role,
        },
      ]}
      onAccept={async (vals: { citizenid: string; role: string }) => {
        showLoadModal();
        await onSubmit(Number(vals.citizenid), vals.role);
      }}
    />
  );
};
