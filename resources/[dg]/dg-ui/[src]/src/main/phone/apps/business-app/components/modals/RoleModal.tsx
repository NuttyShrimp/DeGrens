import React, { FC } from 'react';
import { Input } from '@src/components/inputs';
import { SimpleForm } from '@src/components/simpleform';
import { showLoadModal } from '@src/main/phone/lib';

import { useBusinessAppStore } from '../../stores/useBusinessAppStore';

export const RoleModal: FC<{
  onSubmit: (name: string) => Promise<any>;
}> = ({ onSubmit }) => {
  const roles = useBusinessAppStore(s => s.roles);
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
