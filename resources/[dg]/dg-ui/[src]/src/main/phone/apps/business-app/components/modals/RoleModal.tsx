import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { showLoadModal } from '@src/main/phone/lib';

export const RoleModal: FC<{
  onSubmit: (name: string) => Promise<any>;
}> = ({ onSubmit }) => {
  const roles = useSelector<RootState, Record<string, string[]>>(state => state['phone.apps.business'].roles);
  return (
    <SimpleForm
      elements={[
        {
          name: 'name',
          render: props => (
            <Input.AutoComplete
              {...props}
              label={'Rol'}
              options={Object.keys(roles).map(r => ({ label: r, value: r }))}
            />
          ),
          defaultValue: Object.keys(roles)[0],
        },
      ]}
      onAccept={async (vals: { name: string }) => {
        showLoadModal();
        await onSubmit(vals.name);
      }}
    />
  );
};
